import React from 'react';
import { UsageFormat } from '../types';

interface TableControlsProps {
  usageFormat: UsageFormat;
  onFormatChange: (format: UsageFormat) => void;
  expandedCount: number;
  totalCount: number;
  onToggleAll: () => void;
}

export const TableControls: React.FC<TableControlsProps> = ({
  usageFormat,
  onFormatChange,
  expandedCount,
  totalCount,
  onToggleAll,
}) => {
  return (
    <div
      style={{
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 14, color: '#666' }}>Format:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['css', 'json', 'js'] as UsageFormat[]).map((format) => (
            <button
              key={format}
              type="button"
              onClick={() => onFormatChange(format)}
              style={{
                padding: '4px 12px',
                fontSize: 12,
                background: usageFormat === format ? '#0969da' : 'transparent',
                color: usageFormat === format ? 'white' : '#666',
                border: `1px solid ${usageFormat === format ? '#0969da' : '#e5e7eb'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: usageFormat === format ? 500 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleAll}
        style={{
          padding: '6px 12px',
          fontSize: 12,
          background: 'transparent',
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          cursor: 'pointer',
          color: '#666',
        }}
      >
        {expandedCount === totalCount ? 'Collapse All' : 'Expand All'}
      </button>
    </div>
  );
};
