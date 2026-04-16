import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  pendente: '#ff9f0a', em_andamento: '#0071e3', concluido: '#30d158',
};
const statusLabels = {
  pendente: 'Pendente', em_andamento: 'Em Andamento', concluido: 'Concluído',
};

export default function LimpezaDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/cleaning');
      setRequests(res.data.data || []);
    } catch (e) {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = filter === 'todos' ? requests : requests.filter(r => r.status === filter);

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/cleaning/${id}/status`, { status });
      toast.success('Estado atualizado!');
      fetchRequests();
    } catch (e) {
      toast.error('Erro ao atualizar');
    }
  };

  const counts = {
    todos: requests.length,
    pendente: requests.filter(r => r.status === 'pendente').length,
    em_andamento: requests.filter(r => r.status === 'em_andamento').length,
    concluido: requests.filter(r => r.status === 'concluido').length,
  };

  return (
    <Layout title="Limpeza" subtitle={`${counts.pendente} pedidos pendentes`}>
      <Toaster position="top-right" />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendente', label: 'Pendente' },
          { key: 'em_andamento', label: 'Em Andamento' },
          { key: 'concluido', label: 'Concluído' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === f.key ? '#0071e3' : '#fff',
            color: filter === f.key ? '#fff' : '#1d1d1f',
            fontWeight: filter === f.key ? '600' : '400',
            fontSize: '13px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧹</div>
          <p style={{ color: '#86868b', margin: 0 }}>Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(req => (
            <div key={req.id} style={{
              background: '#fff', borderRadius: '14px', padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '20px',
              borderLeft: `4px solid ${statusColors[req.status]}`,
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: statusColors[req.status] + '20',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
              }}>
                🧹
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
                  Quarto {req.rooms?.number} — Piso {req.rooms?.floor}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#86868b' }}>
                  {req.notes || 'Sem observações'}
                  {req.created_at && ` · ${new Date(req.created_at).toLocaleDateString('pt-PT')}`}
                </p>
              </div>

              <span style={{
                padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                background: req.priority === 'urgente' ? '#ff453a20' : '#86868b20',
                color: req.priority === 'urgente' ? '#ff453a' : '#86868b',
              }}>
                {req.priority === 'urgente' ? '🚨 Urgente' : 'Normal'}
              </span>

              <span style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                background: statusColors[req.status] + '20', color: statusColors[req.status],
                minWidth: '100px', textAlign: 'center',
              }}>
                {statusLabels[req.status]}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                {req.status === 'pendente' && (
                  <button onClick={() => handleStatus(req.id, 'em_andamento')} style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#0071e320', color: '#0071e3',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>
                    ▶ Iniciar
                  </button>
                )}
                {req.status === 'em_andamento' && (
                  <button onClick={() => handleStatus(req.id, 'concluido')} style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#30d15820', color: '#30d158',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>
                    ✅ Concluir
                  </button>
                )}
                {req.status === 'concluido' && (
                  <span style={{ fontSize: '13px', color: '#30d158', fontWeight: '600' }}>
                    ✅ Feito
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}