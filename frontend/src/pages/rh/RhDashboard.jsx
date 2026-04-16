import Layout from '../../components/Layout';

export default function RhDashboard() {
  return (
    <Layout title="Recursos Humanos" subtitle="Gestão de funcionários">
      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👔</div>
        <h2 style={{ color: '#1d1d1f', margin: '0 0 8px' }}>Recursos Humanos</h2>
        <p style={{ color: '#86868b' }}>Usa o menu lateral para ver os funcionários</p>
      </div>
    </Layout>
  );
}