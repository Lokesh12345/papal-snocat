import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMPONENTS_FILE = path.join(__dirname, '../../data/components.json');

export const getAllComponents = async () => {
  const data = await fs.readFile(COMPONENTS_FILE, 'utf-8');
  return JSON.parse(data);
};

export const getComponent = async (id) => {
  const components = await getAllComponents();
  return components.find(c => c.id === id);
};

export const createComponent = async (componentData) => {
  const components = await getAllComponents();

  const newComponent = {
    id: componentData.id || componentData.name.toLowerCase().replace(/\s+/g, '_'),
    name: componentData.name,
    description: componentData.description || '',
    html: componentData.html,
    createdAt: new Date().toISOString()
  };

  components.push(newComponent);
  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(components, null, 2));

  return newComponent;
};

export const updateComponent = async (id, updates) => {
  const components = await getAllComponents();
  const index = components.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error('Component not found');
  }

  components[index] = {
    ...components[index],
    ...updates,
    id: components[index].id
  };

  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(components, null, 2));

  return components[index];
};

export const deleteComponent = async (id) => {
  const components = await getAllComponents();
  const filtered = components.filter(c => c.id !== id);

  if (filtered.length === components.length) {
    throw new Error('Component not found');
  }

  await fs.writeFile(COMPONENTS_FILE, JSON.stringify(filtered, null, 2));
};
