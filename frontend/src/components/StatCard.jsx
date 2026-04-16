const StatCard = ({ icon, label, value, color = '#0071e3', sub }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', alignItems: 'flex-start', gap: '16px',
    border: '1px solid rgba(0,0,0,0.04)',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '14px',
      background: color + '18', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '22px',
      flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#86868b', fontWeight: '500' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '-0.5px' }}>
        {value}
      </p>
      {sub && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#86868b' }}>{sub}</p>}
    </div>
  </div>
);

export default StatCard;