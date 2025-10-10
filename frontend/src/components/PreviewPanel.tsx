import { useState, useEffect } from 'react';
import type { Template, Component } from '../types';
import { localeAPI, componentAPI } from '../services/api';

interface Props {
  template: Template;
  onNavigateToLocales?: () => void;
}

export default function PreviewPanel({ template, onNavigateToLocales }: Props) {
  const [locale, setLocale] = useState('en');
  const [localeData, setLocaleData] = useState<Record<string, string>>({});
  const [components, setComponents] = useState<Component[]>([]);
  const [testData, setTestData] = useState({
    'user.name': 'lokesh',
    'user.email': 'lloke63@gmail.com',
    'transaction.amount': '$50.00',
    'transaction.id': 'TXN-123456',
    'unsubscribe_link': 'https://paypal.com/unsubscribe'
  });

  useEffect(() => {
    loadLocale(locale);
    loadComponents();
  }, [locale]);

  const loadLocale = async (lang: string) => {
    try {
      const response = await localeAPI.getOne(lang);
      setLocaleData(response.data || {});
    } catch (error) {
      setLocaleData({});
    }
  };

  const loadComponents = async () => {
    try {
      const response = await componentAPI.getAll();
      setComponents(response.data);
    } catch (error) {
      console.error('Error loading components:', error);
      setComponents([]);
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

    // Replace component shortcodes first (format: {{temp.component_name}})
    components.forEach(component => {
      const regex = new RegExp(`\\{\\{temp\\.${component.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, component.html);
    });

    // Replace locale data
    Object.entries(localeData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    // Replace test data placeholders
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

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Test Data</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(testData).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <span className="text-gray-600 w-40 text-xs">{key}:</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setTestData({ ...testData, [key]: e.target.value })}
                    className="border rounded px-2 py-1 flex-1 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Locale Keys ({locale.toUpperCase()})</h3>
              {onNavigateToLocales && getLocaleStatus().missing.length > 0 && (
                <button
                  onClick={onNavigateToLocales}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                >
                  → Add Missing
                </button>
              )}
            </div>
            <div className="p-3 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {getLocaleStatus().found.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-1">
                      Found ({getLocaleStatus().found.length})
                    </p>
                    <div className="space-y-1">
                      {getLocaleStatus().found.map(key => (
                        <div key={key} className="bg-green-50 border-l-4 border-green-400 p-2 text-xs">
                          <code className="text-green-700 font-semibold">{'{{' + key + '}}'}</code>
                          <span className="text-gray-600 mx-1">=</span>
                          <span className="text-green-800">{localeData[key]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {getLocaleStatus().missing.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">
                      Missing ({getLocaleStatus().missing.length})
                    </p>
                    <div className="space-y-1">
                      {getLocaleStatus().missing.map(key => (
                        <div key={key} className="bg-red-50 border-l-4 border-red-400 p-2 text-xs">
                          <code className="text-red-700 font-semibold">{'{{' + key + '}}'}</code>
                          <span className="text-gray-600 mx-1">-</span>
                          <span className="text-red-600 italic text-xs">Not found</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {getLocaleStatus().found.length === 0 && getLocaleStatus().missing.length === 0 && (
                  <p className="text-gray-500 italic text-xs">No locale keys used</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Subject:</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {renderTemplate(template.subject)}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTML Preview:</h3>
            <div
              className="border p-4 bg-white rounded overflow-auto text-sm"
              style={{ height: '400px' }}
              dangerouslySetInnerHTML={{ __html: renderTemplate(template.body) }}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">Plain Text:</h3>
            <div className="bg-gray-50 p-3 rounded whitespace-pre-wrap font-mono text-xs overflow-auto" style={{ maxHeight: '150px' }}>
              {renderTemplate(template.text)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
