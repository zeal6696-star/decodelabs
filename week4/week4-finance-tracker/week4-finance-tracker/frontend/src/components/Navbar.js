import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>💰 FinTracker</Link>
        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(location.pathname === '/' ? styles.active : {}) }}>Dashboard</Link>
          <Link to="/transactions" style={{ ...styles.link, ...(location.pathname === '/transactions' ? styles.active : {}) }}>Transactions</Link>
        </div>
        <div style={styles.right}>
          <span style={styles.user}>👤 {user?.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 16px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
  },
  logo: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: '#6C63FF',
    textDecoration: 'none',
  },
  links: { display: 'flex', gap: '4px' },
  link: {
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#718096',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  active: { background: '#f0efff', color: '#6C63FF' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  user: { fontSize: '0.85rem', color: '#718096', fontWeight: '600' },
  logoutBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#718096',
    transition: 'all 0.2s',
  },
};

export default Navbar;
