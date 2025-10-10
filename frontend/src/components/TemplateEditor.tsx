import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import type { Template, Brand, Request, Component } from '../types';
import { templateAPI, requestAPI, localeAPI, componentAPI } from '../services/api';

interface Props {
  brand: Brand;
  template?: Template;
  onSave: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({ brand, template, onSave, onCancel }: Props) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [localeData, setLocaleData] = useState<Record<string, string>>({});
  const [components, setComponents] = useState<Component[]>([]);
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    text: template?.text || '',
  });

  const [testEmail, setTestEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [useCodeEditor, setUseCodeEditor] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [testData] = useState({
    'user.name': 'lokesh',
    'user.email': 'lloke63@gmail.com',
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
    loadLocaleData();
    loadComponents();
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

  const loadLocaleData = async () => {
    try {
      const response = await localeAPI.getOne('en');
      setLocaleData(response.data);
    } catch (error) {
      console.error('Error loading locale data:', error);
    }
  };

  const loadComponents = async () => {
    try {
      const response = await componentAPI.getAll();
      setComponents(response.data);
    } catch (error) {
      console.error('Error loading components:', error);
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

    // Replace component shortcodes first (format: {{temp.component_name}})
    components.forEach(component => {
      const regex = new RegExp(`\\{\\{temp\\.${component.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, component.html);
    });

    // Then replace test data placeholders
    Object.entries(testData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}\\}`, 'g');
      rendered = rendered.replace(regex, value);
    });

    return rendered;
  };

  const validateRealtime = (htmlBody: string, subject: string) => {
    const errors: string[] = [];

    // HTML validation
    const openTags = htmlBody.match(/<(\w+)[^>]*>/g) || [];
    const closeTags = htmlBody.match(/<\/(\w+)>/g) || [];
    const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
    const opens = openTags
      .map(tag => tag.match(/<(\w+)/)![1])
      .filter(tag => !selfClosing.includes(tag));
    const closes = closeTags.map(tag => tag.match(/<\/(\w+)>/)![1]);

    if (opens.length !== closes.length) {
      errors.push('HTML: Mismatched tags detected (unclosed elements)');
    }

    // Link validation
    const links = htmlBody.match(/href=["']([^"']+)["']/g) || [];
    const emptyLinks = links.filter(link => {
      const url = link.match(/href=["']([^"']+)["']/)![1];
      return !url || url === '#' || url === '';
    });
    if (emptyLinks.length > 0) {
      errors.push(`Links: ${emptyLinks.length} empty or invalid link(s) found`);
    }

    // Unsubscribe compliance
    if (htmlBody.includes('<a') && !htmlBody.includes('{{unsubscribe_link}}')) {
      errors.push('Compliance: Missing {{unsubscribe_link}} placeholder');
    }

    // Component validation - check if component shortcodes exist
    const componentPlaceholders = [...htmlBody.matchAll(/\{\{temp\.([^}]+)\}\}/g)];
    const missingComponents: string[] = [];

    componentPlaceholders.forEach(match => {
      const componentId = match[1];
      const componentExists = components.some(c => c.id === componentId);
      if (!componentExists) {
        missingComponents.push(componentId);
      }
    });

    if (missingComponents.length > 0) {
      errors.push(`Components: ${missingComponents.length} missing component(s): ${missingComponents.map(c => `{{temp.${c}}}`).join(', ')}`);
    }

    // Localization validation - check for missing locale keys (excluding components and dynamic data)
    const bodyPlaceholders = htmlBody.match(/\{\{([^}]+)\}\}/g) || [];
    const subjectPlaceholders = subject.match(/\{\{([^}]+)\}\}/g) || [];
    const allPlaceholders = [...bodyPlaceholders, ...subjectPlaceholders];

    const missingLocaleKeys: string[] = [];
    const dynamicKeys = ['user.name', 'user.email', 'transaction.amount', 'transaction.id', 'unsubscribe_link'];

    allPlaceholders.forEach(placeholder => {
      const key = placeholder.replace(/\{\{|\}\}/g, '').trim();
      // Skip component keys (temp.*), dynamic data keys, only check locale keys
      if (!key.startsWith('temp.') && !dynamicKeys.includes(key) && !localeData[key]) {
        missingLocaleKeys.push(key);
      }
    });

    if (missingLocaleKeys.length > 0) {
      errors.push(`Localization: ${missingLocaleKeys.length} missing locale key(s): ${missingLocaleKeys.join(', ')}`);
    }

    if (allPlaceholders.length === 0) {
      errors.push('Info: No placeholders detected (consider adding dynamic content)');
    }

    return errors;
  };

  useEffect(() => {
    if (formData.body || formData.subject) {
      const errors = validateRealtime(formData.body, formData.subject);
      setValidationErrors(errors);
    }
  }, [formData.body, formData.subject, localeData]);

  const handleSendTestEmail = async () => {
    if (!template?.id) {
      setEmailStatus({ type: 'error', message: 'Please save the template first before sending test email' });
      return;
    }

    if (!testEmail) {
      setEmailStatus({ type: 'error', message: 'Please enter a recipient email address' });
      return;
    }

    try {
      setEmailStatus({ type: '', message: 'Sending...' });
      await templateAPI.sendTest(brand, template.id, testEmail);
      setEmailStatus({ type: 'success', message: `Test email sent successfully to ${testEmail}!` });
      setTimeout(() => setEmailStatus({ type: '', message: '' }), 5000);
    } catch (error: any) {
      setEmailStatus({ type: 'error', message: error.response?.data?.error || 'Failed to send email' });
    }
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
                  This template will be linked to the selected request
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">HTML Body</label>
                <div className="flex gap-2">
                  {components.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const shortcode = `{{temp.${e.target.value}}}`;
                          setFormData({ ...formData, body: formData.body + shortcode });
                          e.target.value = '';
                        }
                      }}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="">+ Insert Component</option>
                      {components.map(comp => (
                        <option key={comp.id} value={comp.id}>{comp.name}</option>
                      ))}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setUseCodeEditor(!useCodeEditor)}
                    className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                  >
                    {useCodeEditor ? 'Simple Editor' : 'Code Editor'}
                  </button>
                </div>
              </div>

              {useCodeEditor ? (
                <CodeMirror
                  value={formData.body}
                  height="300px"
                  theme={oneDark}
                  extensions={[html()]}
                  onChange={(value) => setFormData({ ...formData, body: value })}
                  className="border rounded overflow-hidden"
                />
              ) : (
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  rows={12}
                  placeholder="Use {{placeholders}} for dynamic content"
                  required
                />
              )}
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

          {/* Real-time Validation Panel */}
          <div className={`mb-4 border rounded-lg p-3 ${
            validationErrors.length === 0
              ? 'bg-green-50 border-green-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">
                {validationErrors.length === 0 ? 'Validation Passed' : 'Real-time Validation'}
              </span>
            </div>
            {validationErrors.length === 0 ? (
              <p className="text-xs text-green-700">No issues detected. Template is ready for deployment.</p>
            ) : (
              <div className="space-y-1">
                {validationErrors.map((error, idx) => (
                  <p key={idx} className="text-xs text-yellow-800">{error}</p>
                ))}
              </div>
            )}
          </div>

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
                <p>user.name = lokesh</p>
                <p>transaction.amount = $50.00</p>
                <p>transaction.id = TXN-123456</p>
              </div>
            </div>

            {template && (
              <div className="bg-white border rounded p-4">
                <h4 className="text-sm font-semibold mb-3">Send Test Email</h4>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSendTestEmail}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                  >
                    Send Test Email
                  </button>
                  {emailStatus.message && (
                    <div className={`text-xs p-2 rounded ${
                      emailStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                      emailStatus.type === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {emailStatus.message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
