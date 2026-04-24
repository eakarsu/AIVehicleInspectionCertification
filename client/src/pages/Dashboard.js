import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInspections, getCompliances, getConditionScores, getMarketValues, getDamageReports, getVehicleHistories, getRecallAlerts, getInsuranceEstimates, getMaintenanceSchedules, getPartsPricings } from '../services/api';

const features = [
  {
    path: '/inspections',
    title: 'Vehicle Inspections',
    icon: '🔍',
    color: '#3b82f6',
    description: 'AI-powered pre-purchase inspection reports. Comprehensive analysis of vehicle condition, mechanical systems, and safety features.',
    apiCall: getInspections
  },
  {
    path: '/compliance',
    title: 'State Compliance',
    icon: '📋',
    color: '#10b981',
    description: 'Check certification compliance by state. Emissions standards, safety requirements, and registration rules for all 50 states.',
    apiCall: getCompliances
  },
  {
    path: '/condition-scores',
    title: 'Condition Scoring',
    icon: '⭐',
    color: '#f59e0b',
    description: 'Detailed condition scoring with AI-driven grading. Exterior, interior, mechanical, and electrical assessments.',
    apiCall: getConditionScores
  },
  {
    path: '/market-values',
    title: 'Market Valuation',
    icon: '💰',
    color: '#8b5cf6',
    description: 'AI-estimated market values with comparable sales data. Private party, dealer, and trade-in value estimates.',
    apiCall: getMarketValues
  },
  {
    path: '/damage-reports',
    title: 'Damage Detection',
    icon: '🔧',
    color: '#ef4444',
    description: 'AI damage detection and repair cost estimation. Severity assessment, repair recommendations, and insurance guidance.',
    apiCall: getDamageReports
  },
  {
    path: '/vehicle-history',
    title: 'Vehicle History',
    icon: '📜',
    color: '#06b6d4',
    description: 'Comprehensive vehicle history analysis. Ownership, accidents, service records, and title verification.',
    apiCall: getVehicleHistories
  },
  {
    path: '/recall-alerts',
    title: 'Recall Alerts',
    icon: '⚠️',
    color: '#f97316',
    description: 'Track NHTSA safety recalls by make and model. Risk assessment, remedy status, and affected unit tracking.',
    apiCall: getRecallAlerts
  },
  {
    path: '/insurance-estimates',
    title: 'Insurance Estimates',
    icon: '🛡️',
    color: '#14b8a6',
    description: 'AI-powered insurance cost estimation. Coverage analysis, risk scoring, and premium optimization tips.',
    apiCall: getInsuranceEstimates
  },
  {
    path: '/maintenance-schedules',
    title: 'Maintenance Schedule',
    icon: '🔩',
    color: '#a855f7',
    description: 'Recommended maintenance tracking with priority and cost estimates. Never miss a critical service again.',
    apiCall: getMaintenanceSchedules
  },
  {
    path: '/parts-pricing',
    title: 'Parts Pricing',
    icon: '🏷️',
    color: '#ec4899',
    description: 'OEM vs aftermarket parts price comparison. Availability tracking, labor costs, and supplier info.',
    apiCall: getPartsPricings
  }
];

function Dashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const loadCounts = async () => {
      const results = {};
      for (const f of features) {
        try {
          const res = await f.apiCall();
          results[f.path] = res.data.length;
        } catch {
          results[f.path] = 0;
        }
      }
      setCounts(results);
    };
    loadCounts();
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>AI-powered vehicle inspection, certification, and valuation platform</p>
      </div>
      <div className="feature-cards">
        {features.map((feature) => (
          <div
            key={feature.path}
            className="feature-card"
            style={{ '--card-color': feature.color }}
            onClick={() => navigate(feature.path)}
          >
            <div className="card-icon" style={{ background: `${feature.color}20` }}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <div className="card-stats">
              <div className="card-stat">
                <strong>{counts[feature.path] ?? '...'}</strong> Records
              </div>
              <div className="card-stat" style={{ marginLeft: 'auto', color: feature.color }}>
                View All →
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
