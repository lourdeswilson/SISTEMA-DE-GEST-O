import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  pendente: '#ff453a', em_reparo: '#0071e3', resolvido: '#30d158',
};
const statusLabels = {
  pendente: 'Pendente', em_reparo: 'Em Reparação', resolvido: 'Resolvido',
};

export default function Manutencao() {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ room_id: '', problem: '', priority: 'normal', notes: '' });

  const fetchAll = async () => {
    try {
      const [m, r] = await Promise.all([
        api.get('/maintenance'),
        api.get('/rooms'),
      ]);
      setRequests(m.data.data || []);
      setRooms(r.data.data || []);
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'todos' ? requests : requests.filter(r => r.status === filter);

  const handleCreate = async () => {
    if (!form.room_id || !form.problem) { toast.error('Quarto e problema são obrigatórios'); return; }
    setSaving(true);
    try {
      await api.post('/maintenance', form);
      toast.success('Pedido de manutenção criado!');
      setShowModal(false);
      setForm({ room_id: '', problem: '', priority: 'normal', notes: '' });
      fetchAll();
    } catch (e) {
      toast.error('Erro ao criar pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/maintenance/${id}/status`, { status });
      toast.success('Estado atualizado!');
      fetchAll();
    } catch (e) {
      toast.error('Erro ao atualizar');
    }
  };

  const counts = {
    todos: requests.length,
    pendente: requests.filter(r => r.status === 'pendente').length,
    em_reparo: requests.filter(r => r.status === 'em_reparo').length,
    resolvido: requests.filter(r => r.status === 'resolvido').length,
  };

  return (
    <Layout title="Manutenção" subtitle={`${counts.pendente} pedidos pendentes`}>
      <Toaster position="top-right" />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendente', label: 'Pendente' },
          { key: 'em_reparo', label: 'Em Reparação' },
          { key: 'resolvido', label: 'Resolvido' },
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
        <button onClick={() => setShowModal(true)} style={{
          marginLeft: 'auto', padding: '8px 20px', borderRadius: '20px',
          border: 'none', cursor: 'pointer', background: '#1d1d1f',
          color: '#fff', fontWeight: '600', fontSize: '13px',
        }}>
          + Novo Pedido
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
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
                🔧
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
                  Quarto {req.rooms?.number} — {req.problem}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#86868b' }}>
                  Pedido por: {req.requested?.name}
                  {req.notes && ` · ${req.notes}`}
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
                minWidth: '110px', textAlign: 'center',
              }}>
                {statusLabels[req.status]}
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                {req.status === 'pendente' && (
                  <button onClick={() => handleStatus(req.id, 'em_reparo')} style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: '#0071e320', color: '#0071e3',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  }}>
                    🔧 Iniciar
                  </button>
                )}
                {req.status === 'em_reparo' && (
                  <button onClick={() => handleStatus(req.id, 'resolvido')} style={{
                    padding: '8px 12px', borderRadius: '8px', border: 'none',
                    background: '#30d15820', color: '#30d158',
                    cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  }}>
                    ✅ Resolver
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              Novo Pedido de Manutenção
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Quarto *
              </label>
              <select
                value={form.room_id}
                onChange={e => setForm({ ...form, room_id: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px', fontFamily: 'inherit',
                }}
              >
                <option value="">Seleciona um quarto</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Quarto {r.number} — Piso {r.floor}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Problema *
              </label>
              <input
                placeholder="ex: Torneira com fuga, Ar condicionado avariado..."
                value={form.problem}
                onChange={e => setForm({ ...form, problem: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px',
                  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Prioridade
              </label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px', fontFamily: 'inherit',
                }}
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Notas
              </label>
              <textarea
                placeholder="Detalhes adicionais..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px',
                  boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '13px', borderRadius: '12px',
                border: '1.5px solid #e5e5ea', background: '#fff',
                cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1d1d1f',
              }}>
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={saving} style={{
                flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
                background: saving ? '#86868b' : '#0071e3',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', color: '#fff',
              }}>
                {saving ? 'A guardar...' : 'Criar Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}