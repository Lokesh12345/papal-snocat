import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../../data');

export const readJSON = async (filepath) => {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, filepath), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

export const writeJSON = async (filepath, data) => {
  const fullPath = path.join(DATA_DIR, filepath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2));
};

export const listFiles = async (dirPath) => {
  try {
    const fullPath = path.join(DATA_DIR, dirPath);
    const files = await fs.readdir(fullPath);
    return files.filter(f => f.endsWith('.json'));
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

export const deleteFile = async (filepath) => {
  const fullPath = path.join(DATA_DIR, filepath);
  await fs.unlink(fullPath);
};

export const fileExists = async (filepath) => {
  try {
    await fs.access(path.join(DATA_DIR, filepath));
    return true;
  } catch {
    return false;
  }
};
