// StatCard.jsx - Metric card for dashboard statistics

import React from 'react';

export default function StatCard({ title, value, description, icon, variant = 'blue' }) {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value}</span>
        {description && <span className="stat-desc">{description}</span>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${variant}`}>
        {icon}
      </div>
    </div>
  );
}

