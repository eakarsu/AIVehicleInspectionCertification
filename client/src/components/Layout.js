import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊', color: '#3b82f6' },
  { path: '/inspections', label: 'Vehicle Inspections', icon: '🔍', color: '#3b82f6' },
  { path: '/compliance', label: 'State Compliance', icon: '📋', color: '#10b981' },
  { path: '/condition-scores', label: 'Condition Scoring', icon: '⭐', color: '#f59e0b' },
  { path: '/market-values', label: 'Market Valuation', icon: '💰', color: '#8b5cf6' },
  { path: '/damage-reports', label: 'Damage Detection', icon: '🔧', color: '#ef4444' },
  { path: '/vehicle-history', label: 'Vehicle History', icon: '📜', color: '#06b6d4' },
  { path: '/recall-alerts', label: 'Recall Alerts', icon: '⚠️', color: '#f97316' },
  { path: '/insurance-estimates', label: 'Insurance Estimates', icon: '🛡️', color: '#14b8a6' },
  { path: '/maintenance-schedules', label: 'Maintenance', icon: '🔩', color: '#a855f7' },
  { path: '/parts-pricing', label: 'Parts Pricing', icon: '🏷️', color: '#ec4899' },
  { path: '/fleet-summary', label: 'Fleet Summary', icon: '🚗', color: '#22d3ee' },
  { path: '/vin-decoder', label: 'VIN Decoder', icon: '🔢', color: '#a3e635' },
  { path: '/vision-damage', label: 'Vision Damage', icon: '📸', color: '#fb923c' },
  { path: '/certificates', label: 'Certificates', icon: '📄', color: '#34d399' },
  { path: '/ai/predictive-maintenance', label: 'AI Predictive Maint.', icon: '🤖', color: '#3b82f6' },
  { path: '/ai/insurance-estimate', label: 'AI Insurance Est.', icon: '💵', color: '#14b8a6' },
  { path: '/ai/recall-summary', label: 'AI Recall Summary', icon: '🔔', color: '#f97316' },
  { path: '/ai/nhtsa-recall-lookup', label: 'NHTSA Recall Lookup', icon: '🛡️', color: '#ef4444' },
  { path: '/ai/parts-price-monitor', label: 'Parts Price Monitor', icon: '💲', color: '#84cc16' },
];

function Layout({ children, user, onLogout }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>AutoInspect AI</h2>
          <span>Vehicle Inspection & Certification</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="nav-icon" style={{ background: `${item.color}20` }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || ''}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
