import { useState, useEffect } from 'react';
import type { Template, Brand } from '../types';
import { templateAPI, localeAPI } from '../services/api';
import TemplateEditor from '../components/TemplateEditor';
import PreviewPanel from '../components/PreviewPanel';

interface Props {
  onNavigate?: (page: string) => void;
}

export default function Templates({ onNavigate }: Props) {
  const [brand, setBrand] = useState<Brand>('paypal');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [mode, setMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [locales, setLocales] = useState<any[]>([]);

  useEffect(() => {
    loadTemplates();
    loadLocales();
  }, [brand]);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll(brand);
      setTemplates(response.data);
      setMode('list');
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadLocales = async () => {
    try {
      const response = await localeAPI.getAll();
      setLocales(response.data);
    } catch (error) {
      console.error('Error loading locales:', error);
    }
  };

  const getLocaleStatus = (template: Template) => {
    const localePlaceholders = template.placeholders.filter(p =>
      !p.includes('.') && !p.includes('_link')
    );

    if (localePlaceholders.length === 0 || locales.length === 0) {
      return { total: 0, found: 0, missing: 0, byLanguage: [], totalPossible: 0, localesCount: 0 };
    }

    const totalKeys = localePlaceholders.length;
    const totalLocales = locales.length;
    const totalPossible = totalKeys * totalLocales;

    let foundCount = 0;
    let missingCount = 0;
    const byLanguage: { lang: string; found: number; missing: number; total: number; percentage: number }[] = [];

    locales.forEach(locale => {
      let langFound = 0;
      let langMissing = 0;

      localePlaceholders.forEach(placeholder => {
        if (locale.data && locale.data[placeholder]) {
          langFound++;
          foundCount++;
        } else {
          langMissing++;
          missingCount++;
        }
      });

      const percentage = Math.round((langFound / totalKeys) * 100);
      byLanguage.push({
        lang: locale.lang,
        found: langFound,
        missing: langMissing,
        total: totalKeys,
        percentage
      });
    });

    return {
      total: totalKeys,
      found: foundCount,
      missing: missingCount,
      totalPossible,
      localesCount: totalLocales,
      byLanguage
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Template Management</h1>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as Brand)}
          className="border rounded px-4 py-2"
        >
          <option value="paypal">PayPal</option>
          <option value="venmo">Venmo</option>
          <option value="zettle">Zettle</option>
          <option value="xoom">Xoom</option>
          <option value="fastlane">Fastlane</option>
        </select>
      </div>

      {mode === 'list' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => setMode('edit')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create New Template
            </button>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => {
              const localeStatus = getLocaleStatus(template);
              return (
                <div key={template.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-gray-500">
                          Version {template.version} • Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </p>
                        {localeStatus.total > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-600 font-medium">Localization Coverage:</span>
                              <span className="font-semibold text-gray-700">
                                {localeStatus.found}/{localeStatus.totalPossible} translations
                              </span>
                              <span className="text-gray-500">
                                ({localeStatus.total} keys × {localeStatus.localesCount} locales)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {localeStatus.byLanguage.map(lang => (
                                <div
                                  key={lang.lang}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                                    lang.percentage === 100
                                      ? 'bg-green-100 text-green-800'
                                      : lang.percentage >= 50
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  <span className="font-semibold uppercase">{lang.lang}</span>
                                  <span>
                                    {lang.percentage === 100 ? 'OK' : `${lang.found}/${lang.total}`}
                                  </span>
                                  {lang.percentage !== 100 && (
                                    <span className="text-[10px]">({lang.percentage}%)</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setMode('preview');
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setMode('edit');
                        }}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {templates.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No templates found. Create your first template!
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <TemplateEditor
          brand={brand}
          template={selectedTemplate || undefined}
          onSave={loadTemplates}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'preview' && selectedTemplate && (
        <div>
          <button
            onClick={() => setMode('list')}
            className="mb-4 text-blue-600 hover:underline"
          >
            ← Back to List
          </button>
          <PreviewPanel
            template={selectedTemplate}
            onNavigateToLocales={onNavigate ? () => onNavigate('qa') : undefined}
          />
        </div>
      )}
    </div>
  );
}
