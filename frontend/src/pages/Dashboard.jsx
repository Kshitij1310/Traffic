import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Car, Clock, Siren, Wand2 } from 'lucide-react';
import { trafficApi } from '../services/api';
import StatsCard from '../components/StatsCard';
import TrafficLight from '../components/TrafficLight';
import AlertBar from '../components/AlertBar';
import Button from '../components/Button';
import { TrafficTrendChart, LaneDistributionChart } from '../components/ChartCard';

const Dashboard = () => {
  const [trafficData, setTrafficData] = useState({
    lanes: {
      lane1: { count: 0, signal: 'red', timer: 0 },
      lane2: { count: 0, signal: 'red', timer: 0 },
      lane3: { count: 0, signal: 'red', timer: 0 },
      lane4: { count: 0, signal: 'red', timer: 0 },
    },
    emergency: { active: false, lane: null },
  });
  const [alert, setAlert] = useState({ visible: false, type: 'info', title: '', message: '' });
  const [trendData, setTrendData] = useState([]);
  const [detection, setDetection] = useState(null);
  const [laneSelect, setLaneSelect] = useState('lane1');

  const totalVehicles = useMemo(() => {
    return Object.values(trafficData.lanes).reduce((sum, lane) => sum + lane.count, 0);
  }, [trafficData]);

  const activeLane = useMemo(() => {
    const entry = Object.entries(trafficData.lanes).find(([, lane]) => lane.signal === 'green');
    return entry ? entry[0] : '-';
  }, [trafficData]);

  const avgWaitTime = useMemo(() => {
    const total = Object.values(trafficData.lanes).reduce((sum, lane) => sum + lane.timer, 0);
    return Math.round(total / 4);
  }, [trafficData]);

  const showAlert = (type, title, message) => {
    setAlert({ visible: true, type, title, message });
    setTimeout(() => setAlert((prev) => ({ ...prev, visible: false })), 4000);
  };

  const loadTrafficData = async () => {
    try {
      const data = await trafficApi.getTrafficData();
      setTrafficData(data);

      const now = new Date().toLocaleTimeString();
      setTrendData((prev) => {
        const next = [...prev, { time: now, count: data.lanes.lane1.count + data.lanes.lane2.count + data.lanes.lane3.count + data.lanes.lane4.count }];
        return next.slice(-20);
      });

      if (data.emergency.active) {
        showAlert('error', 'Emergency Override Active', `${data.emergency.lane.toUpperCase()} has priority signal`);
      }
    } catch (error) {
      showAlert('error', 'Connection Issue', 'Backend is not responding. Start Flask server.');
    }
  };

  const simulateTraffic = async () => {
    try {
      await trafficApi.simulateTraffic();
      showAlert('success', 'Simulation Complete', 'Traffic data updated');
      loadTrafficData();
    } catch (error) {
      showAlert('error', 'Simulation Failed', 'Unable to generate data');
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('lane_id', laneSelect);

    try {
      showAlert('info', 'Detecting Vehicles', 'Processing uploaded image');
      const response = await trafficApi.detectVehicles(formData);
      setDetection(response.detections);
      showAlert('success', 'Detection Complete', `${response.detections.total} vehicles detected`);
      loadTrafficData();
    } catch (error) {
      showAlert('error', 'Detection Failed', 'Check backend and try again');
    }
  };

  const detectFromWebcam = async () => {
    try {
      showAlert('info', 'Webcam Detection', 'Capturing frame');
      await trafficApi.detectFromWebcam(laneSelect);
      showAlert('success', 'Detection Complete', 'Vehicle count updated');
      loadTrafficData();
    } catch (error) {
      showAlert('error', 'Webcam Error', 'Unable to access webcam');
    }
  };

  useEffect(() => {
    loadTrafficData();
    const interval = setInterval(loadTrafficData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Traffic Monitoring Dashboard</h1>
          <p className="text-slate-600">Live vehicle detection and AI-driven signal optimization.</p>
        </div>
        <Button variant="secondary" onClick={simulateTraffic}>
          <Wand2 className="mr-2 h-4 w-4" />
          Simulate Traffic
        </Button>
      </div>

      <AlertBar {...alert} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Car className="h-5 w-5" />}
          title="Total"
          value={totalVehicles}
          subtitle="Vehicles Detected"
          color="teal"
        />
        <StatsCard
          icon={<BarChart3 className="h-5 w-5" />}
          title="Active"
          value={activeLane.toUpperCase()}
          subtitle="Green Lane"
          color="amber"
        />
        <StatsCard
          icon={<Siren className="h-5 w-5" />}
          title="Emergency"
          value={trafficData.emergency.active ? 'ACTIVE' : 'Normal'}
          subtitle="Priority Status"
          color="rose"
        />
        <StatsCard
          icon={<Clock className="h-5 w-5" />}
          title="Average"
          value={`${avgWaitTime}s`}
          subtitle="Wait Time"
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Live Traffic Signals</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(trafficData.lanes).map(([laneId, lane]) => (
              <div key={laneId} className="text-center">
                <TrafficLight laneId={laneId} signal={lane.signal} />
                <p className="mt-3 font-semibold text-slate-800">{laneId.toUpperCase()}</p>
                <p className="text-sm text-slate-500">{lane.count} vehicles</p>
                <p className="text-xs text-slate-400">{lane.timer}s</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Optimization Rules</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>0-5 vehicles</span>
              <span className="font-semibold text-slate-900">15s green</span>
            </div>
            <div className="flex items-center justify-between">
              <span>6-15 vehicles</span>
              <span className="font-semibold text-slate-900">30s green</span>
            </div>
            <div className="flex items-center justify-between">
              <span>16-25 vehicles</span>
              <span className="font-semibold text-slate-900">45s green</span>
            </div>
            <div className="flex items-center justify-between">
              <span>25+ vehicles</span>
              <span className="font-semibold text-slate-900">60s green</span>
            </div>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-slate-700">
              Lane with maximum traffic gets the green signal first. Emergency mode overrides all signals.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TrafficTrendChart data={trendData} />
        <LaneDistributionChart laneData={Object.values(trafficData.lanes).map((lane) => lane.count)} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Vehicle Detection</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-600">Upload a traffic image for detection</p>
              <input type="file" id="imageUpload" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <label htmlFor="imageUpload" className="inline-flex items-center justify-center mt-4">
                <Button variant="primary">Choose Image</Button>
              </label>

              <div className="mt-4">
                <select
                  value={laneSelect}
                  onChange={(e) => setLaneSelect(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="lane1">Lane 1</option>
                  <option value="lane2">Lane 2</option>
                  <option value="lane3">Lane 3</option>
                  <option value="lane4">Lane 4</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={detectFromWebcam}>
                Detect From Webcam
              </Button>
            </div>
          </div>

          <div>
            {detection ? (
              <div className="space-y-3">
                {[
                  { label: 'Cars', value: detection.cars },
                  { label: 'Buses', value: detection.buses },
                  { label: 'Trucks', value: detection.trucks },
                  { label: 'Bikes', value: detection.bikes },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="font-semibold text-slate-900">{item.value || 0}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-teal-50 px-4 py-3">
                  <span className="text-sm text-teal-800 font-medium">Total Vehicles</span>
                  <span className="text-xl font-semibold text-teal-900">{detection.total}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-500">
                Upload an image to see detection results.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
