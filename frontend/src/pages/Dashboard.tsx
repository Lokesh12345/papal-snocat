import { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';

interface Props {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    deployed: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await requestAPI.getAll();
      const requests = response.data;
      setStats({
        total: requests.length,
        active: requests.filter(r => r.status !== 'deployed').length,
        deployed: requests.filter(r => r.status === 'deployed').length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">SNOCAT Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Total Requests</p>
          <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Active</p>
          <p className="text-4xl font-bold text-orange-600">{stats.active}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 mb-2">Deployed</p>
          <p className="text-4xl font-bold text-green-600">{stats.deployed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onNavigate('templates')}
            className="border-2 border-blue-200 rounded p-4 hover:bg-blue-50 transition text-left"
          >
            <h3 className="font-semibold mb-1">Manage Templates</h3>
            <p className="text-sm text-gray-600">Create and edit notification templates</p>
          </button>

          <button
            onClick={() => onNavigate('requests')}
            className="border-2 border-blue-200 rounded p-4 hover:bg-blue-50 transition text-left"
          >
            <h3 className="font-semibold mb-1">Request Queue</h3>
            <p className="text-sm text-gray-600">View and manage incoming requests</p>
          </button>

          <button
            onClick={() => onNavigate('qa')}
            className="border-2 border-blue-200 rounded p-4 hover:bg-blue-50 transition text-left"
          >
            <h3 className="font-semibold mb-1">QA Validation</h3>
            <p className="text-sm text-gray-600">Run quality checks before deployment</p>
          </button>

          <button
            onClick={() => onNavigate('debug')}
            className="border-2 border-blue-200 rounded p-4 hover:bg-blue-50 transition text-left"
          >
            <h3 className="font-semibold mb-1">Debug Issues</h3>
            <p className="text-sm text-gray-600">Troubleshoot live production issues</p>
          </button>
        </div>
      </div>
    </div>
  );
}
