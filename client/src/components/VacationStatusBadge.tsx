import React from 'react';
import type { VacationStatus } from '../types';
import '../styles/variables.css';

const STATUS_CONFIG: Record<VacationStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Ожидает', color: '#856404', bg: '#fff3cd' },
  approved: { label: 'Утверждено', color: '#155724', bg: '#d4edda' },
  rejected: { label: 'Отклонено', color: '#721c24', bg: '#f8d7da' },
  ordered: { label: 'Приказ оформлен', color: '#004085', bg: '#cce5ff' },
  cancelled: { label: 'Отменено', color: '#6c757d', bg: '#e2e3e5' },
};

interface VacationStatusBadgeProps {
  status: VacationStatus;
}

const VacationStatusBadge: React.FC<VacationStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className="vacation-status-badge" style={{ color: config.color, backgroundColor: config.bg }}>
      {config.label}
    </span>
  );
};

export default VacationStatusBadge;
