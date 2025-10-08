import { useState, useEffect } from 'react';
import type { Template, Brand } from '../types';
import { templateAPI } from '../services/api';
import QADashboard from '../components/QADashboard';
import LocaleManager from '../components/LocaleManager';

export default function QA() {
  const [brand, setBrand] = useState<Brand>('paypal');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [view, setView] = useState<'validation' | 'locales'>('validation');

  useEffect(() => {
    loadTemplates();
  }, [brand]);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getAll(brand);
      setTemplates(response.data);
      if (response.data.length > 0) {
        setSelectedTemplate(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quality Assurance</h1>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setView('validation')}
          className={`px-4 py-2 rounded ${view === 'validation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Template Validation
        </button>
        <button
          onClick={() => setView('locales')}
          className={`px-4 py-2 rounded ${view === 'locales' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Locale Management
        </button>
      </div>

      {view === 'validation' && (
        <div>
          <div className="mb-4 flex gap-4">
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

            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setSelectedTemplate(template || null);
              }}
              className="border rounded px-4 py-2 flex-1"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && <QADashboard template={selectedTemplate} />}
          {!selectedTemplate && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No templates available for validation
            </div>
          )}
        </div>
      )}

      {view === 'locales' && <LocaleManager />}
    </div>
  );
}
