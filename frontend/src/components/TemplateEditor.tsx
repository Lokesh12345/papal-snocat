import { useState, useEffect } from 'react';
import type { Template, Brand, Request } from '../types';
import { templateAPI, requestAPI } from '../services/api';

interface Props {
  brand: Brand;
  template?: Template;
  onSave: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({ brand, template, onSave, onCancel }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    text: template?.text || '',
  });

  const [testData] = useState({
    'user.name': 'John Doe',
    'user.email': 'john@example.com',
    'transaction.amount': '$50.00',
    'transaction.id': 'TXN-123456',
    'unsubscribe_link': 'https://paypal.com/unsubscribe',
    'greeting': 'Hello',
    'payment_success': 'Your payment was successful',
    'payment_amount': 'Amount',
    'transaction_id': 'Transaction ID',
    'footer': 'Thank you for using PayPal',
    'unsubscribe': 'Unsubscribe from emails',
    'customer_support': 'Need help? Contact support'
  });

  useEffect(() => {
    loadRequests();
  }, [brand]);

  const loadRequests = async () => {
    try {
      const response = await requestAPI.getAll();
      const brandRequests = response.data.filter((r: Request) => r.brand === brand);
      setRequests(brandRequests);

      if (template) {
        const linkedRequest = brandRequests.find((r: Request) => r.templateId === template.id);
        if (linkedRequest) {
          setSelectedRequestId(linkedRequest.id);
        }
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let savedTemplate;
      if (template) {
        savedTemplate = await templateAPI.update(brand, template.id, formData);
      } else {
        savedTemplate = await templateAPI.create(brand, formData);
      }

      if (selectedRequestId) {
        await requestAPI.update(selectedRequestId, {
          templateId: savedTemplate.data.id
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const renderPreview = (text: string) => {
    let rendered = text;
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });
    return rendered;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">
        {template ? 'Edit Template' : 'Create New Template'}
      </h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Editor</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {selectedRequestId && (
                <p className="text-xs text-gray-600 mt-1">
                  ✓ This template will be linked to the selected request
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Payment Confirmation - {{transaction.id}}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">HTML Body</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full border rounded px-3 py-2 font-mono text-sm"
                rows={12}
                placeholder="Use {{placeholders}} for dynamic content"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Plain Text Version</label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={6}
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {template ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Live Preview</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2 text-gray-600">Subject:</p>
              <div className="bg-gray-50 border rounded px-3 py-2">
                {formData.subject ? renderPreview(formData.subject) : <span className="text-gray-400">Subject will appear here...</span>}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-gray-600">HTML Preview:</p>
              <div
                className="border rounded p-4 bg-white min-h-[300px] overflow-auto"
                style={{ maxHeight: '500px' }}
                dangerouslySetInnerHTML={{
                  __html: formData.body ? renderPreview(formData.body) : '<p class="text-gray-400">HTML preview will appear here...</p>'
                }}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2 text-gray-600">Plain Text:</p>
              <div className="bg-gray-50 border rounded p-3 whitespace-pre-wrap font-mono text-sm overflow-auto" style={{ maxHeight: '200px' }}>
                {formData.text ? renderPreview(formData.text) : <span className="text-gray-400 not-italic font-sans">Plain text preview will appear here...</span>}
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-sm font-semibold mb-1">Test Data Used:</p>
              <div className="text-xs text-gray-700 space-y-1">
                <p>user.name = John Doe</p>
                <p>transaction.amount = $50.00</p>
                <p>transaction.id = TXN-123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
