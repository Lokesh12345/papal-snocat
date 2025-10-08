import DebugSimulator from '../components/DebugSimulator';
import Analytics from '../components/Analytics';

export default function Debug() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Debug & Analytics</h1>

      <div className="space-y-6">
        <DebugSimulator />
        <Analytics />
      </div>
    </div>
  );
}
