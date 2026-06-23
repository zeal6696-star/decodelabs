import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const EXPENSE_CATS = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Rent', 'Utilities', 'Other'];
const INCOME_CATS = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'];

const emptyForm = { title: '', amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], note: '' };

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '', month: '', year: '' });
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category) params.append('category', filters.category);
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      const res = await axios.get(`/api/transactions?${params}`);
      setTransactions(res.data.data);
      setStats({ totalIncome: res.data.totalIncome, totalExpense: res.data.totalExpense, balance: res.data.balance });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
  const openEdit = (tx) => {
    setEditId(tx._id);
    setForm({ title: tx.title, amount: tx.amount, type: tx.type, category: tx.category, date: new Date(tx.date).toISOString().split('T')[0], note: tx.note || '' });
    setFormError('');
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'type') {
      updated.category = e.target.value === 'income' ? 'Salary' : 'Food';
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title.trim()) return setFormError('Title is required');
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setFormError('Enter a valid amount');
    setSubmitting(true);
    try {
      if (editId) {
        await axios.put(`/api/transactions/${editId}`, form);
      } else {
        await axios.post('/api/transactions', form);
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await axios.delete(`/api/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert('Delete failed');
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['Title', 'Amount', 'Type', 'Category', 'Date', 'Note'];
    const rows = transactions.map((t) => [
      t.title, t.amount, t.type, t.category,
      new Date(t.date).toLocaleDateString('en-IN'), t.note || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transactions.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const cats = form.type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  return (
    <div>
      <div className="transactions-header">
        <h2>All Transactions</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Transaction</button>
        </div>
      </div>

      {/* Mini stats */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card income">
          <span className="stat-label">Income</span>
          <span className="stat-value">+₹{stats.totalIncome.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card expense">
          <span className="stat-label">Expense</span>
          <span className="stat-value">-₹{stats.totalExpense.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card balance">
          <span className="stat-label">Balance</span>
          <span className="stat-value" style={{ color: stats.balance >= 0 ? '#2ecc71' : '#e74c3c' }}>
            {stats.balance >= 0 ? '+' : '-'}₹{Math.abs(stats.balance).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}>
          <option value="">All Months</option>
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })}>
          <option value="">All Years</option>
          {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
        </select>
        {(filters.type || filters.month || filters.year) && (
          <button className="btn btn-sm btn-outline" onClick={() => setFilters({ type: '', category: '', month: '', year: '' })}>✕ Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#718096' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions found.</p>
            <button className="btn btn-primary" onClick={openAdd}>Add your first transaction</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{t.title}</div>
                      {t.note && <div style={{ fontSize: '0.75rem', color: '#718096' }}>{t.note}</div>}
                    </td>
                    <td><span className="badge badge-category">{t.category}</span></td>
                    <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                    <td className={`amount-${t.type}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td>{new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(t._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Transaction' : 'Add Transaction'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Type Toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn ${form.type === 'income' ? 'active-income' : ''}`}
                onClick={() => handleFormChange({ target: { name: 'type', value: 'income' } })}>
                ⬆ Income
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === 'expense' ? 'active-expense' : ''}`}
                onClick={() => handleFormChange({ target: { name: 'type', value: 'expense' } })}>
                ⬇ Expense
              </button>
            </div>

            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input name="title" value={form.title} onChange={handleFormChange} placeholder="e.g. Salary, Groceries" required />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input name="amount" type="number" value={form.amount} onChange={handleFormChange} placeholder="0" min="1" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleFormChange}>
                  {cats.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input name="note" value={form.note} onChange={handleFormChange} placeholder="Optional note..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Saving...' : editId ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
