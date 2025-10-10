import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SMS_FILE = path.join(__dirname, '../../data/sms.json');

export const getAllSMS = async (brand) => {
  try {
    const data = await fs.readFile(SMS_FILE, 'utf-8');
    const allSMS = JSON.parse(data);
    return brand ? allSMS.filter(sms => sms.brand === brand) : allSMS;
  } catch (error) {
    return [];
  }
};

export const getSMSById = async (id) => {
  const allSMS = await getAllSMS();
  return allSMS.find(sms => sms.id === id);
};

export const createSMS = async (smsData) => {
  const allSMS = await getAllSMS();

  const placeholders = extractPlaceholders(smsData.message);

  const newSMS = {
    id: `sms-${Date.now()}`,
    name: smsData.name,
    brand: smsData.brand,
    message: smsData.message,
    placeholders,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  allSMS.push(newSMS);
  await fs.writeFile(SMS_FILE, JSON.stringify(allSMS, null, 2));
  return newSMS;
};

export const updateSMS = async (id, updates) => {
  const allSMS = await getAllSMS();
  const index = allSMS.findIndex(sms => sms.id === id);

  if (index === -1) {
    throw new Error('SMS not found');
  }

  const placeholders = updates.message
    ? extractPlaceholders(updates.message)
    : allSMS[index].placeholders;

  allSMS[index] = {
    ...allSMS[index],
    ...updates,
    placeholders,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(SMS_FILE, JSON.stringify(allSMS, null, 2));
  return allSMS[index];
};

export const deleteSMS = async (id) => {
  const allSMS = await getAllSMS();
  const filtered = allSMS.filter(sms => sms.id !== id);

  if (filtered.length === allSMS.length) {
    throw new Error('SMS not found');
  }

  await fs.writeFile(SMS_FILE, JSON.stringify(filtered, null, 2));
  return { success: true };
};

function extractPlaceholders(text) {
  const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '').trim()))];
}
