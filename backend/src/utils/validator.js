export const extractPlaceholders = (template) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const placeholders = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    placeholders.push(match[1].trim());
  }
  return [...new Set(placeholders)];
};

export const validateHTML = (html) => {
  const issues = [];

  const openTags = html.match(/<(\w+)[^>]*>/g) || [];
  const closeTags = html.match(/<\/(\w+)>/g) || [];

  const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
  const opens = openTags
    .map(tag => tag.match(/<(\w+)/)[1])
    .filter(tag => !selfClosing.includes(tag));
  const closes = closeTags.map(tag => tag.match(/<\/(\w+)>/)[1]);

  if (opens.length !== closes.length) {
    issues.push('Mismatched HTML tags detected');
  }

  return issues;
};

export const validateLinks = (html) => {
  const issues = [];
  const links = html.match(/href=["']([^"']+)["']/g) || [];

  links.forEach(link => {
    const url = link.match(/href=["']([^"']+)["']/)[1];
    if (!url || url === '#' || url === '') {
      issues.push(`Empty or invalid link: ${url}`);
    }
  });

  return issues;
};

export const hasBrandCompliance = (template, brand) => {
  const issues = [];

  if (!template.body.includes('{{unsubscribe_link}}') && template.body.includes('<a')) {
    issues.push('Missing unsubscribe link placeholder');
  }

  return issues;
};
