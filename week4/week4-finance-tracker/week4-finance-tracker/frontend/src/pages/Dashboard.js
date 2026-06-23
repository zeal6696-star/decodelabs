import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [summary, setSummary] = useState({ monthly: [], categoryBreakdown: {} });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, summaryRes] = await Promise.all([
        axios.get('/api/transactions'),
        axios.get(`/api/transactions/summary?year=${year}`),
      ]);
      setStats({
        totalIncome: txRes.data.totalIncome,
        totalExpense: txRes.data.totalExpense,
        balance: txRes.data.balance,
      });
      setRecentTx(txRes.data.data.slice(0, 5));
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Income',
        data: summary.monthly.map((m) => m.income),
        backgroundColor: 'rgba(46, 204, 113, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Expense',
        data: summary.monthly.map((m) => m.expense),
        backgroundColor: 'rgba(231, 76, 60, 0.7)',
        borderRadius: 6,
      },
    ],
  };

  const catLabels = Object.keys(summary.categoryBreakdown);
  const catValues = Object.values(summary.categoryBreakdown);
  const COLORS = ['#6C63FF','#FF6384','#36A2EB','#FFCE56','#4BC0C0','#FF9F40','#9966FF','#FF6384','#C9CBCF'];

  const doughnutData = {
    labels: catLabels,
    datasets: [{
      data: catValues,
      backgroundColor: COLORS.slice(0, catLabels.length),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  };

  const formatCurrency = (n) => `₹${Math.abs(n).toLocaleString('en-IN')}`;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p style={{ color: '#718096', marginTop: '4px' }}>Here's your financial overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card income">
          <span className="stat-label">Total Income</span>
          <span className="stat-value">+{formatCurrency(stats.totalIncome)}</span>
        </div>
        <div className="stat-card expense">
          <span className="stat-label">Total Expenses</span>
          <span className="stat-value">-{formatCurrency(stats.totalExpense)}</span>
        </div>
        <div className="stat-card balance">
          <span className="stat-label">Net Balance</span>
          <span className="stat-value" style={{ color: stats.balance >= 0 ? '#2ecc71' : '#e74c3c' }}>
            {stats.balance >= 0 ? '+' : '-'}{formatCurrency(stats.balance)}
          </span>
        </div>
      </div>

      {/* Year picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#718096' }}>YEAR:</span>
        <select value={year} onChange={(e) => setYear(e.target.value)} style={{ padding: '6px 12px', border: '2px solid #e2e8f0', borderRadius: '8px', fontWeight: '600' }}>
          {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3>📊 Monthly Income vs Expense ({year})</h3>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        {catLabels.length > 0 && (
          <div className="chart-card">
            <h3>🍩 Expense by Category</h3>
            <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
          </div>
        )}
        {/* Recent Transactions */}
        <div className="chart-card">
          <h3>🕐 Recent Transactions</h3>
          {recentTx.length === 0 ? (
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>No transactions yet. Add one!</p>
          ) : (
            <div>
              {recentTx.map((t) => (
                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>{t.category} · {new Date(t.date).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style={{ fontWeight: '700', color: t.type === 'income' ? '#2ecc71' : '#e74c3c' }}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
