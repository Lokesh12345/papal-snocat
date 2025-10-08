import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Requests from './pages/Requests';
import QA from './pages/QA';
import Debug from './pages/Debug';

type Page = 'dashboard' | 'templates' | 'requests' | 'qa' | 'debug';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'templates': return <Templates onNavigate={setCurrentPage} />;
      case 'requests': return <Requests />;
      case 'qa': return <QA />;
      case 'debug': return <Debug />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">SNOCAT</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-3 py-2 rounded ${currentPage === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('templates')}
              className={`px-3 py-2 rounded ${currentPage === 'templates' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              Templates
            </button>
            <button
              onClick={() => setCurrentPage('requests')}
              className={`px-3 py-2 rounded ${currentPage === 'requests' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              Requests
            </button>
            <button
              onClick={() => setCurrentPage('qa')}
              className={`px-3 py-2 rounded ${currentPage === 'qa' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              QA
            </button>
            <button
              onClick={() => setCurrentPage('debug')}
              className={`px-3 py-2 rounded ${currentPage === 'debug' ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              Debug
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
