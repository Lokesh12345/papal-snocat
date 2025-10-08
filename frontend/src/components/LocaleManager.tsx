import { useState, useEffect } from 'react';
import { localeAPI } from '../services/api';
import type { Locale } from '../types';

export default function LocaleManager() {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadLocales();
  }, []);

  useEffect(() => {
    if (selectedLang) {
      loadLocaleData(selectedLang);
    }
  }, [selectedLang]);

  const loadLocales = async () => {
    try {
      const response = await localeAPI.getAll();
      setLocales(response.data);
    } catch (error) {
      console.error('Error loading locales:', error);
    }
  };

  const loadLocaleData = async (lang: string) => {
    try {
      const response = await localeAPI.getOne(lang);
      setEditData(response.data || {});
    } catch (error) {
      setEditData({});
    }
  };

  const handleSave = async () => {
    try {
      await localeAPI.update(selectedLang, editData);
      alert('Locale saved successfully!');
      loadLocales();
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  };

  const handleAddKey = () => {
    if (newKey && newValue) {
      setEditData({ ...editData, [newKey]: newValue });
      setNewKey('');
      setNewValue('');
    }
  };

  const handleDeleteKey = (key: string) => {
    const updated = { ...editData };
    delete updated[key];
    setEditData(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Localization Manager</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select Language</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="border rounded px-3 py-2"
        >
          {locales.map((locale) => (
            <option key={locale.lang} value={locale.lang}>
              {locale.lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 space-y-2">
        <h3 className="font-semibold">Translation Keys</h3>
        {Object.entries(editData).map(([key, value]) => (
          <div key={key} className="flex gap-2 items-center">
            <input
              type="text"
              value={key}
              className="border rounded px-2 py-1 w-1/3 bg-gray-100"
              disabled
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
              className="border rounded px-2 py-1 flex-1"
            />
            <button
              onClick={() => handleDeleteKey(key)}
              className="bg-red-500 text-white px-2 py-1 rounded text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Add New Key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="border rounded px-2 py-1 w-1/3"
          />
          <input
            type="text"
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            onClick={handleAddKey}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}
