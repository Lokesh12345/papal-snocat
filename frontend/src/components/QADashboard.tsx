import { useState } from 'react';
import type { Template, ValidationResult } from '../types';
import { validationAPI } from '../services/api';

interface Props {
  template: Template;
}

export default function QADashboard({ template }: Props) {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    try {
      const response = await validationAPI.validate(template);
      setResult(response.data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'fail': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100';
      case 'warning': return 'bg-yellow-100';
      case 'fail': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">QA Validation</h2>
        <button
          onClick={runValidation}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {result && (
        <div>
          <div className={`p-4 rounded mb-4 ${getStatusBg(result.status)}`}>
            <h3 className={`text-lg font-bold ${getStatusColor(result.status)}`}>
              Overall Status: {result.status.toUpperCase()}
            </h3>
            {result.status === 'fail' && (
              <p className="text-sm mt-1">⚠️ Template BLOCKED from deployment</p>
            )}
            {result.status === 'warning' && (
              <p className="text-sm mt-1">⚠️ Review warnings before deployment</p>
            )}
            {result.status === 'pass' && (
              <p className="text-sm mt-1">✅ Ready for deployment</p>
            )}
          </div>

          <div className="space-y-3">
            {result.checks.map((check, idx) => (
              <div key={idx} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{check.name}</h4>
                  <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                    {check.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                {check.details && Array.isArray(check.details) && check.details.length > 0 && (
                  <div className="bg-gray-50 p-2 rounded text-sm">
                    {check.name === 'Locale Completeness' ? (
                      <div className="space-y-1">
                        {check.details.map((locale: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span>{locale.lang}: {locale.completeness}%</span>
                            {locale.status !== 'complete' && (
                              <span className="text-red-600 text-xs">
                                Missing: {locale.missingKeys.length} keys
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="list-disc list-inside">
                        {check.details.map((item: any, i: number) => (
                          <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && (
        <div className="text-center text-gray-500 py-8">
          Click "Run Validation" to check this template
        </div>
      )}
    </div>
  );
}
