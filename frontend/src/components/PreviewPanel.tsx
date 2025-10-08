import { useState, useEffect } from 'react';
import type { Template } from '../types';
import { localeAPI } from '../services/api';

interface Props {
  template: Template;
  onNavigateToLocales?: () => void;
}

export default function PreviewPanel({ template, onNavigateToLocales }: Props) {
  const [locale, setLocale] = useState('en');
  const [localeData, setLocaleData] = useState<Record<string, string>>({});
  const [testData, setTestData] = useState({
    'user.name': 'John Doe',
    'user.email': 'john@example.com',
    'transaction.amount': '$50.00',
    'transaction.id': 'TXN-123456',
    'unsubscribe_link': 'https://paypal.com/unsubscribe'
  });

  useEffect(() => {
    loadLocale(locale);
  }, [locale]);

  const loadLocale = async (lang: string) => {
    try {
      const response = await localeAPI.getOne(lang);
      setLocaleData(response.data || {});
    } catch (error) {
      setLocaleData({});
    }
  };

  const getUsedLocaleKeys = () => {
    return template.placeholders.filter(p =>
      !p.includes('.') && !p.includes('_link')
    );
  };

  const getLocaleStatus = () => {
    const usedKeys = getUsedLocaleKeys();
    const found: string[] = [];
    const missing: string[] = [];

    usedKeys.forEach(key => {
      if (localeData[key]) {
        found.push(key);
      } else {
        missing.push(key);
      }
    });

    return { found, missing };
  };

  const renderTemplate = (text: string) => {
    let rendered = text;

    Object.entries(localeData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    return rendered;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Preview</h2>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Test Data</h3>
        <div className="space-y-1 text-sm">
          {Object.entries(testData).map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <span className="text-gray-600 w-40">{key}:</span>
              <input
                type="text"
                value={value}
                onChange={(e) => setTestData({ ...testData, [key]: e.target.value })}
                className="border rounded px-2 py-1 flex-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 border rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-semibold text-sm">Template Locale Keys Status ({locale.toUpperCase()})</h3>
          {onNavigateToLocales && getLocaleStatus().missing.length > 0 && (
            <button
              onClick={onNavigateToLocales}
              className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
            >
              → Add Missing Keys
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {getLocaleStatus().found.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-700 mb-2">
                  ✓ Found ({getLocaleStatus().found.length})
                </p>
                <div className="space-y-1">
                  {getLocaleStatus().found.map(key => (
                    <div key={key} className="bg-green-50 border-l-4 border-green-400 p-2 text-xs">
                      <code className="text-green-700 font-semibold">{'{{' + key + '}}'}</code>
                      <span className="text-gray-600 mx-2">=</span>
                      <span className="text-green-800">{localeData[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getLocaleStatus().missing.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2">
                  ✗ Missing ({getLocaleStatus().missing.length})
                </p>
                <div className="space-y-1">
                  {getLocaleStatus().missing.map(key => (
                    <div key={key} className="bg-red-50 border-l-4 border-red-400 p-2 text-xs">
                      <code className="text-red-700 font-semibold">{'{{' + key + '}}'}</code>
                      <span className="text-gray-600 mx-2">-</span>
                      <span className="text-red-600 italic">Not found in {locale}.json</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getLocaleStatus().found.length === 0 && getLocaleStatus().missing.length === 0 && (
              <p className="text-gray-500 italic text-sm">No locale keys used in this template</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Subject:</h3>
          <div className="bg-gray-50 p-3 rounded">
            {renderTemplate(template.subject)}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2">HTML Preview:</h3>
          <div
            className="border p-4 bg-white rounded min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: renderTemplate(template.body) }}
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Plain Text:</h3>
          <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap font-mono text-sm">
            {renderTemplate(template.text)}
          </div>
        </div>
      </div>
    </div>
  );
}
