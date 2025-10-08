import { useState, useEffect } from 'react';
import type { Request, Template } from '../types';
import { requestAPI, templateAPI } from '../services/api';

export default function RequestQueue() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [templates, setTemplates] = useState<Record<string, Template[]>>({});

  useEffect(() => {
    loadRequests();
    loadAllTemplates();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await requestAPI.getAll();
      setRequests(response.data);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadAllTemplates = async () => {
    const brands = ['paypal', 'venmo', 'zettle', 'xoom', 'fastlane'];
    const allTemplates: Record<string, Template[]> = {};

    for (const brand of brands) {
      try {
        const response = await templateAPI.getAll(brand as any);
        allTemplates[brand] = response.data;
      } catch (error) {
        allTemplates[brand] = [];
      }
    }

    setTemplates(allTemplates);
  };

  const updateStatus = async (id: string, status: Request['status']) => {
    try {
      await requestAPI.update(id, { status });
      loadRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const linkTemplate = async (requestId: string, templateId: string) => {
    try {
      await requestAPI.update(requestId, { templateId });
      loadRequests();
    } catch (error) {
      console.error('Error linking template:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P0': return 'bg-red-100 text-red-800';
      case 'P1': return 'bg-orange-100 text-orange-800';
      case 'P2': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-gray-200 text-gray-800';
      case 'in-progress': return 'bg-blue-200 text-blue-800';
      case 'localization': return 'bg-purple-200 text-purple-800';
      case 'qa-review': return 'bg-yellow-200 text-yellow-800';
      case 'deployed': return 'bg-green-200 text-green-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.brand === filter);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Request Queue</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Brands</option>
          <option value="paypal">PayPal</option>
          <option value="venmo">Venmo</option>
          <option value="zettle">Zettle</option>
          <option value="xoom">Xoom</option>
          <option value="fastlane">Fastlane</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredRequests.map((request) => {
          const brandTemplates = templates[request.brand] || [];
          const linkedTemplate = brandTemplates.find(t => t.id === request.templateId);

          return (
            <div key={request.id} className="border rounded p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className="text-sm text-gray-600">{request.description}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">
                    <span className="font-semibold capitalize">{request.brand}</span> •
                    <span className="ml-2">Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-medium">Linked Template:</span>
                  {linkedTemplate ? (
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        ✓ {linkedTemplate.name}
                      </span>
                      <button
                        onClick={() => linkTemplate(request.id, '')}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {brandTemplates.length > 0 ? (
                        <select
                          value={request.templateId || ''}
                          onChange={(e) => linkTemplate(request.id, e.target.value)}
                          className="border rounded px-2 py-1 text-xs"
                        >
                          <option value="">Select template...</option>
                          {brandTemplates.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-500 italic">
                          No templates available for {request.brand}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {request.status !== 'deployed' && (
                <div className="flex justify-end mt-3">
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(request.id, e.target.value as Request['status'])}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="in-progress">In Progress</option>
                    <option value="localization">Localization</option>
                    <option value="qa-review">QA Review</option>
                    <option value="deployed">Deployed</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No requests found
        </div>
      )}
    </div>
  );
}
