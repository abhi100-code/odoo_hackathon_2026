'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { useTheme } from './ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export function VehicleStatusChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          '#10b981',
          '#6366f1',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 1,
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#f8fafc' : '#0f172a',
          font: { family: 'Outfit' },
        },
      },
    },
  };

  return <div style={{ height: '240px' }}><Doughnut data={chartData} options={options} /></div>;
}

export function ExpensesByCategoryChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Expense ($)',
        data: Object.values(data),
        backgroundColor: [
          '#6366f1',
          '#f59e0b',
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
          '#64748b',
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { titleFont: { family: 'Outfit' }, bodyFont: { family: 'Plus Jakarta Sans' } },
    },
    scales: {
      y: {
        grid: { color: isDark ? '#334155' : '#cbd5e1' },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
    },
  };

  return <div style={{ height: '240px' }}><Bar data={chartData} options={options} /></div>;
}

export function RevenueVsExpensesChart({ labels, revenue, expenses }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenue,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Expenses ($)',
        data: expenses,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: isDark ? '#f8fafc' : '#0f172a', font: { family: 'Outfit' } },
      },
    },
    scales: {
      y: {
        grid: { color: isDark ? '#334155' : '#cbd5e1' },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
    },
  };

  return <div style={{ height: '260px' }}><Line data={chartData} options={options} /></div>;
}

export function DriverPerformanceChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Safety Score',
        data: data.map((d) => d.safetyScore),
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        max: 100,
        grid: { color: isDark ? '#334155' : '#cbd5e1' },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
      y: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#475569', font: { family: 'Plus Jakarta Sans' } },
      },
    },
  };

  return <div style={{ height: '240px' }}><Bar data={chartData} options={options} /></div>;
}
