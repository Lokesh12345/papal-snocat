import { validateHTML, validateLinks, hasBrandCompliance, extractPlaceholders } from '../utils/validator.js';
import { checkLocaleCompleteness } from './localeService.js';

export const validateTemplate = async (template) => {
  const results = {
    status: 'pass',
    checks: []
  };

  const localeCheck = await checkLocaleCompleteness(template.placeholders || []);
  const allLocalesComplete = localeCheck.every(l => l.completeness === 100);

  results.checks.push({
    name: 'Locale Completeness',
    status: allLocalesComplete ? 'pass' : 'warning',
    message: allLocalesComplete
      ? 'All locales are complete'
      : `${localeCheck.filter(l => l.status !== 'complete').length} locales incomplete`,
    details: localeCheck
  });

  const placeholders = extractPlaceholders(template.body + (template.subject || ''));
  results.checks.push({
    name: 'Placeholder Validation',
    status: placeholders.length > 0 ? 'pass' : 'warning',
    message: `Found ${placeholders.length} placeholders`,
    details: placeholders
  });

  const htmlIssues = validateHTML(template.body);
  results.checks.push({
    name: 'HTML Structure',
    status: htmlIssues.length === 0 ? 'pass' : 'fail',
    message: htmlIssues.length === 0 ? 'Valid HTML structure' : `${htmlIssues.length} issues found`,
    details: htmlIssues
  });

  const linkIssues = validateLinks(template.body);
  results.checks.push({
    name: 'Link Validation',
    status: linkIssues.length === 0 ? 'pass' : 'warning',
    message: linkIssues.length === 0 ? 'All links valid' : `${linkIssues.length} issues found`,
    details: linkIssues
  });

  const complianceIssues = hasBrandCompliance(template, template.brand);
  results.checks.push({
    name: 'Brand Compliance',
    status: complianceIssues.length === 0 ? 'pass' : 'warning',
    message: complianceIssues.length === 0 ? 'Compliant' : `${complianceIssues.length} issues found`,
    details: complianceIssues
  });

  const hasFailures = results.checks.some(c => c.status === 'fail');
  const hasWarnings = results.checks.some(c => c.status === 'warning');

  if (hasFailures) {
    results.status = 'fail';
  } else if (hasWarnings) {
    results.status = 'warning';
  }

  return results;
};
