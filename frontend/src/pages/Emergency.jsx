import { useEffect, useState } from 'react';
import { AlertTriangle, Ambulance, CheckCircle2, Siren } from 'lucide-react';
import Button from '../components/Button';
import { trafficApi } from '../services/api';

const Emergency = () => {
  const [lane, setLane] = useState('lane1');
  const [isActive, setIsActive] = useState(false);
  const [history, setHistory] = useState([]);

  const loadHistory = async () => {
    try {
      const data = await trafficApi.getEmergencyHistory();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error('Failed to load emergency history');
    }
  };

  const activateEmergency = async () => {
    await trafficApi.emergencyOverride(lane, true);
    setIsActive(true);
  };

  const deactivateEmergency = async () => {
    await trafficApi.emergencyOverride(lane, false);
    setIsActive(false);
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-2">
          <Siren className="h-7 w-7 text-rose-600" />
          Emergency Vehicle Priority
        </h1>
        <p className="text-slate-600">Override signals to provide a green corridor for emergency vehicles.</p>
      </div>

      {isActive && (
        <div className="mb-6 rounded-xl border-l-4 border-rose-600 bg-rose-50 p-5 text-rose-900 animate-flash">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Emergency Override Active</p>
              <p className="text-sm">{lane.toUpperCase()} has priority green signal.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <Ambulance className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Activate Emergency</h2>
              <p className="text-sm text-slate-600">Select lane and turn priority on.</p>
            </div>
          </div>

          <select
            value={lane}
            onChange={(e) => setLane(e.target.value)}
            className="w-full mb-4 rounded-md border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="lane1">Lane 1 - North</option>
            <option value="lane2">Lane 2 - East</option>
            <option value="lane3">Lane 3 - South</option>
            <option value="lane4">Lane 4 - West</option>
          </select>

          <Button variant="danger" className="w-full" onClick={activateEmergency}>
            Activate Emergency Mode
          </Button>

          <p className="mt-4 text-xs text-rose-700">
            All other lanes will turn red, emergency lane gets 90 seconds green.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl ${isActive ? 'bg-rose-50' : 'bg-teal-50'} flex items-center justify-center`}>
              <CheckCircle2 className={`h-6 w-6 ${isActive ? 'text-rose-600' : 'text-teal-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Deactivate Emergency</h2>
              <p className="text-sm text-slate-600">Resume AI traffic optimization.</p>
            </div>
          </div>

          <div className="mb-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            Status: <span className="font-semibold text-slate-900">{isActive ? 'EMERGENCY ACTIVE' : 'SYSTEM NORMAL'}</span>
          </div>

          <Button variant="outline" className="w-full" onClick={deactivateEmergency}>
            Deactivate Emergency Mode
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Emergency History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500 border-b">
              <tr>
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Timestamp</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {history.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-semibold">{item.id}</td>
                  <td className="py-2 pr-4">{item.timestamp}</td>
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.detected ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-700'}`}>
                      {item.detected ? 'Emergency Detected' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
