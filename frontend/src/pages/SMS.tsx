import { useState, useEffect } from 'react';
import type { SMS as SMSType, Brand, Request } from '../types';
import { smsAPI, localeAPI, requestAPI } from '../services/api';

export default function SMS() {
  const [brand, setBrand] = useState<Brand>('paypal');
  const [smsList, setSmsList] = useState<SMSType[]>([]);
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [selectedSMS, setSelectedSMS] = useState<SMSType | null>(null);
  const [locales, setLocales] = useState<any[]>([]);
  const [previewLocale, setPreviewLocale] = useState('en');
  const [localeData, setLocaleData] = useState<Record<string, string>>({});
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    message: '',
  });

  const testData = {
    'user.name': 'lokesh',
    'transaction.amount': '$50.00',
    'transaction.id': 'TXN-123456',
  };

  useEffect(() => {
    loadSMS();
    loadLocales();
    loadRequests();
  }, [brand]);

  useEffect(() => {
    loadLocaleData(previewLocale);
  }, [previewLocale]);

  const loadSMS = async () => {
    try {
      const response = await smsAPI.getAll(brand);
      setSmsList(response.data);
      setMode('list');
      setSelectedSMS(null);
    } catch (error) {
      console.error('Error loading SMS:', error);
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

  const loadLocaleData = async (lang: string) => {
    try {
      const response = await localeAPI.getOne(lang);
      setLocaleData(response.data || {});
    } catch (error) {
      setLocaleData({});
    }
  };

  const loadRequests = async () => {
    try {
      const response = await requestAPI.getAll();
      const brandRequests = response.data.filter((r: Request) => r.brand === brand);
      setRequests(brandRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    }
  };

  const handleEdit = (sms: SMSType) => {
    setSelectedSMS(sms);
    setFormData({
      name: sms.name,
      message: sms.message,
    });

    // Find linked request
    const linkedRequest = requests.find((r: Request) => r.smsId === sms.id);
    setSelectedRequestId(linkedRequest ? linkedRequest.id : '');

    setMode('edit');
  };

  const handleCreate = () => {
    setSelectedSMS(null);
    setFormData({
      name: '',
      message: '',
    });
    setSelectedRequestId('');
    setMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedSMS;
      if (selectedSMS) {
        savedSMS = await smsAPI.update(selectedSMS.id, formData);
      } else {
        savedSMS = await smsAPI.create({ ...formData, brand });
      }

      // Link request if selected
      if (selectedRequestId) {
        await requestAPI.update(selectedRequestId, {
          smsId: savedSMS.data.id
        });
      }

      loadSMS();
      loadRequests();
    } catch (error) {
      console.error('Error saving SMS:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this SMS?')) {
      try {
        await smsAPI.delete(id);
        loadSMS();
      } catch (error) {
        console.error('Error deleting SMS:', error);
      }
    }
  };

  const renderPreview = (text: string) => {
    let rendered = text;

    // Replace locale data
    Object.entries(localeData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    // Replace test data
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    return rendered;
  };

  const getLocaleStatus = (sms: SMSType) => {
    const localePlaceholders = sms.placeholders.filter(p =>
      !p.includes('.') && !p.includes('_link')
    );

    if (localePlaceholders.length === 0 || locales.length === 0) {
      return { total: 0, found: 0, missing: 0 };
    }

    const totalKeys = localePlaceholders.length;
    const totalLocales = locales.length;
    let foundCount = 0;

    locales.forEach(locale => {
      localePlaceholders.forEach(placeholder => {
        if (locale.data && locale.data[placeholder]) {
          foundCount++;
        }
      });
    });

    return {
      total: totalKeys,
      found: foundCount,
      missing: (totalKeys * totalLocales) - foundCount,
      totalPossible: totalKeys * totalLocales,
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">SMS Management</h1>
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
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Create New SMS
            </button>
          </div>

          <div className="grid gap-4">
            {smsList.map((sms) => {
              const localeStatus = getLocaleStatus(sms);
              const linkedRequest = requests.find((r: Request) => r.smsId === sms.id);
              return (
                <div key={sms.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{sms.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 font-mono bg-gray-50 p-2 rounded">
                        {sms.message}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          Updated {new Date(sms.updatedAt).toLocaleDateString()}
                        </p>
                        {linkedRequest && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-600 font-medium">Linked Request:</span>
                            <span className="font-semibold text-blue-700">
                              [{linkedRequest.priority}] {linkedRequest.title}
                            </span>
                          </div>
                        )}
                        {localeStatus.total > 0 && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-600 font-medium">Localization:</span>
                            <span className={`font-semibold ${
                              localeStatus.found === localeStatus.totalPossible
                                ? 'text-green-700'
                                : 'text-yellow-700'
                            }`}>
                              {localeStatus.found}/{localeStatus.totalPossible} translations
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(sms)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(sms.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {smsList.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No SMS messages found. Create your first SMS!
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">
            {selectedSMS ? 'Edit SMS' : 'Create New SMS'}
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Editor</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SMS Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Link to Request (Optional)</label>
                  <select
                    value={selectedRequestId}
                    onChange={(e) => setSelectedRequestId(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">No request linked</option>
                    {requests.map((req) => (
                      <option key={req.id} value={req.id}>
                        [{req.priority}] {req.title} - {req.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Message (Max 160 characters recommended)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full border rounded px-3 py-2 font-mono text-sm"
                    rows={6}
                    placeholder="Use {{placeholders}} for dynamic content"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Raw: {formData.message.length} chars | Rendered: {renderPreview(formData.message).length} chars
                    {renderPreview(formData.message).length > 160 && (
                      <span className="text-orange-600 ml-2">
                        (Warning: Over 160 characters may split into multiple SMS)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {selectedSMS ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('list')}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Live Preview</h3>
                <select
                  value={previewLocale}
                  onChange={(e) => setPreviewLocale(e.target.value)}
                  className="text-sm border rounded px-3 py-1"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-blue-100 rounded-full p-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">{brand.charAt(0).toUpperCase() + brand.slice(1)}</p>
                        <p className="text-sm">
                          {formData.message ? renderPreview(formData.message) : 'Your SMS preview will appear here...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                  <p className="text-sm font-semibold mb-1">Test Data Used:</p>
                  <div className="text-xs text-gray-700 space-y-1">
                    <p>user.name = lokesh</p>
                    <p>transaction.amount = $50.00</p>
                    <p>transaction.id = TXN-123456</p>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-3">
                  <p className="text-sm font-semibold mb-1">SMS Best Practices:</p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    <li>Keep messages under 160 characters</li>
                    <li>Use clear, concise language</li>
                    <li>Include only essential information</li>
                    <li>Test across multiple locales</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
