import { useState } from 'react';

interface Issue {
  id: string;
  title: string;
  symptom: string;
  diagnosis: string;
  fix: string;
  status: 'active' | 'investigating' | 'fixed';
}

const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Missing German Locale',
    symptom: 'Payment confirmation emails failing for German users (de_DE)',
    diagnosis: 'Locale file de.json is missing required translation keys',
    fix: 'Upload complete de.json file with all required keys',
    status: 'active'
  },
  {
    id: '2',
    title: 'Broken Placeholder',
    symptom: 'Email shows {{user.nane}} instead of customer name',
    diagnosis: 'Typo in template placeholder (nane vs name)',
    fix: 'Update template to use correct placeholder {{user.name}}',
    status: 'active'
  },
  {
    id: '3',
    title: 'Malformed HTML',
    symptom: 'Venmo receipt email layout is broken in Gmail',
    diagnosis: 'Unclosed <div> tag in template body',
    fix: 'Add missing closing </div> tag on line 42',
    status: 'active'
  }
];

export default function DebugSimulator() {
  const [issues, setIssues] = useState<Issue[]>(MOCK_ISSUES);

  const updateIssueStatus = (id: string, status: Issue['status']) => {
    setIssues(issues.map(issue =>
      issue.id === id ? { ...issue, status } : issue
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'fixed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Live Issues Debugger</h2>
      <p className="text-sm text-gray-600 mb-6">
        Simulates common production issues and debugging workflow
      </p>

      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="border-2 border-red-200 rounded p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-red-700"> {issue.title}</h3>
                <p className="text-sm text-gray-600">Reported: 5 minutes ago</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(issue.status)}`}>
                {issue.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <span className="font-semibold text-sm">Symptom:</span>
                <p className="text-sm text-gray-700">{issue.symptom}</p>
              </div>

              {issue.status !== 'active' && (
                <>
                  <div>
                    <span className="font-semibold text-sm">Diagnosis:</span>
                    <p className="text-sm text-gray-700">{issue.diagnosis}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Fix:</span>
                    <p className="text-sm text-green-700">{issue.fix}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {issue.status === 'active' && (
                <button
                  onClick={() => updateIssueStatus(issue.id, 'investigating')}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Investigate
                </button>
              )}
              {issue.status === 'investigating' && (
                <>
                  <button
                    onClick={() => updateIssueStatus(issue.id, 'fixed')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Deploy Fix
                  </button>
                  <button
                    onClick={() => updateIssueStatus(issue.id, 'active')}
                    className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </>
              )}
              {issue.status === 'fixed' && (
                <span className="text-green-600 text-sm font-semibold">
                  Issue Resolved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
