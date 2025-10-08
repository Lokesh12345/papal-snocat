import { readJSON, writeJSON, listFiles, deleteFile } from '../utils/fileManager.js';
import { extractPlaceholders } from '../utils/validator.js';

export const getAllTemplates = async (brand) => {
  const files = await listFiles(`templates/${brand}`);
  const templates = await Promise.all(
    files.map(async (file) => {
      const data = await readJSON(`templates/${brand}/${file}`);
      return data;
    })
  );
  return templates.filter(Boolean);
};

export const getTemplate = async (brand, id) => {
  return await readJSON(`templates/${brand}/${id}.json`);
};

export const createTemplate = async (brand, template) => {
  const id = template.id || generateId(template.name);
  const templateData = {
    ...template,
    id,
    brand,
    placeholders: extractPlaceholders(template.body + (template.subject || '')),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1
  };

  await writeJSON(`templates/${brand}/${id}.json`, templateData);
  return templateData;
};

export const updateTemplate = async (brand, id, updates) => {
  const existing = await getTemplate(brand, id);
  if (!existing) throw new Error('Template not found');

  const updated = {
    ...existing,
    ...updates,
    id,
    brand,
    placeholders: extractPlaceholders(updates.body + (updates.subject || '')),
    updatedAt: new Date().toISOString(),
    version: existing.version + 1
  };

  await writeJSON(`templates/${brand}/${id}.json`, updated);
  return updated;
};

export const deleteTemplate = async (brand, id) => {
  await deleteFile(`templates/${brand}/${id}.json`);
};

const generateId = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};
