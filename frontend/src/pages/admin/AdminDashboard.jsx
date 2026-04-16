import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const statusColors = {
  disponivel: '#30d158', ocupado: '#ff453a',
  reservado: '#ffd60a', limpeza: '#0071e3', manutencao: '#ff9f0a',
};

const statusLabels = {
  disponivel: 'Disponível', ocupado: 'Ocupado',
  reservado: 'Reservado', limpeza: 'Limpeza', manutencao: 'Manutenção',
};

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [cleaning, setCleaning] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r, g, c, m] = await Promise.all([
          api.get('/rooms'),
          api.get('/guests'),
          api.get('/cleaning'),
          api.get('/maintenance'),
        ]);
        setRooms(r.data.data || []);
        setGuests(g.data.data || []);
        setCleaning(c.data.data || []);
        setMaintenance(m.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const disponivel = rooms.filter(r => r.status === 'disponivel').length;
  const ocupado = rooms.filter(r => r.status === 'ocupado').length;
  const limpeza = rooms.filter(r => r.status === 'limpeza').length;
  const manutencao = rooms.filter(r => r.status === 'manutencao').length;
  const checkedIn = guests.filter(g => g.status === 'checked-in').length;
  const cleanPending = cleaning.filter(c => c.status === 'pendente').length;
  const maintPending = maintenance.filter(m => m.status === 'pendente').length;

  if (loading) return (
    <Layout title="Dashboard" subtitle="Visão geral do residencial">
      <div style={{ textAlign: 'center', padding: '80px', color: '#86868b' }}>
        A carregar...
      </div>
    </Layout>
  );

  return (
    <Layout title="Dashboard" subtitle="Visão geral do So Victoria">

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard icon="🛏" label="Quartos Disponíveis" value={disponivel} color="#30d158" sub={`${rooms.length} quartos total`} />
        <StatCard icon="👥" label="Hóspedes Ativos" value={checkedIn} color="#0071e3" />
        <StatCard icon="🧹" label="Limpezas Pendentes" value={cleanPending} color="#ff9f0a" />
        <StatCard icon="🔧" label="Manutenções Pendentes" value={maintPending} color="#ff453a" />
      </div>

      {/* Grid de quartos + actividade */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>

        {/* Quartos */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#1d1d1f' }}>Estado dos Quartos</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <span key={key} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', color: '#86868b',
                }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColors[key], display: 'inline-block' }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {rooms.map(room => (
              <div key={room.id} style={{
                padding: '14px 10px', borderRadius: '12px',
                background: statusColors[room.status] + '15',
                border: `1.5px solid ${statusColors[room.status]}40`,
                textAlign: 'center', cursor: 'default',
              }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f' }}>
                  {room.number}
                </div>
                <div style={{ fontSize: '10px', color: statusColors[room.status], fontWeight: '600', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  {statusLabels[room.status]}
                </div>
                <div style={{ fontSize: '10px', color: '#86868b', marginTop: '2px' }}>
                  {room.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividade recente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Limpezas */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
              🧹 Limpezas Recentes
            </h3>
            {cleaning.slice(0, 4).length === 0 ? (
              <p style={{ color: '#86868b', fontSize: '13px', margin: 0 }}>Sem pedidos</p>
            ) : cleaning.slice(0, 4).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f2f2f7' }}>
                <span style={{ fontSize: '13px', color: '#1d1d1f' }}>
                  Quarto {c.rooms?.number}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px',
                  background: c.status === 'pendente' ? '#ff9f0a20' : c.status === 'concluido' ? '#30d15820' : '#0071e320',
                  color: c.status === 'pendente' ? '#ff9f0a' : c.status === 'concluido' ? '#30d158' : '#0071e3',
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          {/* Manutenções */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
              🔧 Manutenções Recentes
            </h3>
            {maintenance.slice(0, 4).length === 0 ? (
              <p style={{ color: '#86868b', fontSize: '13px', margin: 0 }}>Sem pedidos</p>
            ) : maintenance.slice(0, 4).map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f2f2f7' }}>
                <span style={{ fontSize: '13px', color: '#1d1d1f' }}>
                  Quarto {m.rooms?.number}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px',
                  background: m.status === 'pendente' ? '#ff453a20' : m.status === 'resolvido' ? '#30d15820' : '#ff9f0a20',
                  color: m.status === 'pendente' ? '#ff453a' : m.status === 'resolvido' ? '#30d158' : '#ff9f0a',
                }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}