import { readJSON, writeJSON, listFiles } from '../utils/fileManager.js';

const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'it', 'ko', 'ar'];

export const getAllLocales = async () => {
  const files = await listFiles('locales');
  const locales = await Promise.all(
    files.map(async (file) => {
      const lang = file.replace('.json', '');
      const data = await readJSON(`locales/${file}`);
      return { lang, data };
    })
  );
  return locales;
};

export const getLocale = async (lang) => {
  return await readJSON(`locales/${lang}.json`);
};

export const updateLocale = async (lang, data) => {
  await writeJSON(`locales/${lang}.json`, data);
  return data;
};

export const checkLocaleCompleteness = async (requiredKeys) => {
  const results = [];

  for (const lang of SUPPORTED_LOCALES) {
    const data = await getLocale(lang);

    if (!data) {
      results.push({
        lang,
        status: 'missing',
        completeness: 0,
        missingKeys: requiredKeys
      });
      continue;
    }

    const existingKeys = Object.keys(data);
    const missingKeys = requiredKeys.filter(key => !existingKeys.includes(key));
    const completeness = Math.round(((requiredKeys.length - missingKeys.length) / requiredKeys.length) * 100);

    results.push({
      lang,
      status: completeness === 100 ? 'complete' : 'partial',
      completeness,
      missingKeys
    });
  }

  return results;
};

export const getSupportedLocales = () => SUPPORTED_LOCALES;
