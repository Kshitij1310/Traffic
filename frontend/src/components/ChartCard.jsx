import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const TrafficTrendChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.time),
    datasets: [
      {
        label: 'Total Vehicles',
        data: data.map(item => item.count),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.12)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Traffic Trend (Last Hour)</h2>
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  );
};

export const LaneDistributionChart = ({ laneData }) => {
  const chartData = {
    labels: ['Lane 1', 'Lane 2', 'Lane 3', 'Lane 4'],
    datasets: [
      {
        data: laneData,
        backgroundColor: ['#0f766e', '#14b8a6', '#f59e0b', '#ef4444'],
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Lane Distribution</h2>
      <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
    </div>
  );
};
