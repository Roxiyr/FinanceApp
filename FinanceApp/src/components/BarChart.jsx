import React from 'react';

export default function BarChart({ data = [], width = 600, barHeight = 28, gap = 12, labelWidth = 140 }) {
  const max = data.reduce((m, d) => Math.max(m, Math.abs(d.value || 0)), 0) || 1;
  const chartWidth = width - labelWidth - 20;
  return (
    <div style={{ width: width }}>
      {data.map((d, i) => {
        const w = Math.round((Math.abs(d.value) / max) * chartWidth);
        const color = d.color || '#6b21a8';
        return (
          <div key={d.label || i} style={{ display: 'flex', alignItems: 'center', marginBottom: gap }}>
            <div style={{ width: labelWidth, fontSize: 13, color: '#374151' }}>{d.label}</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ height: barHeight, width: w, background: color, borderRadius: 8 }} />
              <div style={{ minWidth: 80, textAlign: 'right', fontWeight: 700 }}>{d.format ? d.format(d.value) : d.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
