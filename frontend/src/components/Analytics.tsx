import { useState, useEffect } from 'react';
import type { Analytics as AnalyticsType } from '../types';
import { analyticsAPI } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsType | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsAPI.get();
      setData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  if (!data) {
    return <div className="bg-white rounded-lg shadow p-6">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Analytics & Metrics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Total Requests</p>
          <p className="text-3xl font-bold text-blue-700">{data.totalRequests}</p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Avg Cycle Time</p>
          <p className="text-3xl font-bold text-green-700">{data.avgCycleTimeHours}h</p>
        </div>

        <div className="bg-orange-50 p-4 rounded">
          <p className="text-sm text-gray-600">Bottleneck</p>
          <p className="text-xl font-bold text-orange-700 capitalize">{data.bottleneck}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <h3 className="font-semibold mb-3">Status Breakdown</h3>
          <div className="space-y-2">
            {Object.entries(data.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm capitalize">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Brand Distribution</h3>
          <div className="space-y-2">
            {Object.entries(data.brandBreakdown).map(([brand, count]) => (
              <div key={brand} className="flex justify-between items-center">
                <span className="text-sm capitalize">{brand}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Priority Levels</h3>
          <div className="space-y-2">
            {Object.entries(data.priorityBreakdown).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm">{priority}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <h3 className="font-semibold mb-2">⚠️ Bottleneck Analysis</h3>
        <p className="text-sm text-gray-700">
          The <strong className="capitalize">{data.bottleneck}</strong> stage is currently the slowest.
          Consider allocating more resources or streamlining this process.
        </p>
      </div>
    </div>
  );
}
