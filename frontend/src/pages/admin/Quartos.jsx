import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  disponivel: '#30d158', ocupado: '#ff453a',
  reservado: '#ffd60a', limpeza: '#0071e3', manutencao: '#ff9f0a',
};

const statusLabels = {
  disponivel: 'Disponível', ocupado: 'Ocupado',
  reservado: 'Reservado', limpeza: 'Limpeza', manutencao: 'Manutenção',
};

const typeLabels = { single: 'Single', double: 'Double', suite: 'Suite' };

export default function Quartos() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [form, setForm] = useState({ number: '', type: 'single', floor: '', price_per_night: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data.data || []);
    } catch (e) {
      toast.error('Erro ao carregar quartos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const filtered = filter === 'todos' ? rooms : rooms.filter(r => r.status === filter);

  const openCreate = () => {
    setEditRoom(null);
    setForm({ number: '', type: 'single', floor: '', price_per_night: '', notes: '' });
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({ number: room.number, type: room.type, floor: room.floor, price_per_night: room.price_per_night, notes: room.notes || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.number || !form.floor || !form.price_per_night) {
      toast.error('Preenche todos os campos obrigatórios');
      return;
    }
    setSaving(true);
    try {
      if (editRoom) {
        await api.put(`/rooms/${editRoom.id}`, form);
        toast.success('Quarto atualizado!');
      } else {
        await api.post('/rooms', form);
        toast.success('Quarto criado!');
      }
      setShowModal(false);
      fetchRooms();
    } catch (e) {
      toast.error('Erro ao guardar quarto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tens a certeza que queres apagar este quarto?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Quarto apagado!');
      fetchRooms();
    } catch (e) {
      toast.error('Erro ao apagar quarto');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/rooms/${id}`, { status });

      if (status === 'limpeza') {
        await api.post('/cleaning', {
          room_id: id,
          priority: 'normal',
          notes: 'Pedido criado automaticamente ao mudar estado do quarto',
        });
        toast.success('Quarto em limpeza — pedido criado automaticamente!');
      } else if (status === 'manutencao') {
        await api.post('/maintenance', {
          room_id: id,
          problem: 'Problema reportado via painel de quartos',
          priority: 'normal',
          notes: 'Pedido criado automaticamente ao mudar estado do quarto',
        });
        toast.success('Quarto em manutenção — pedido criado automaticamente!');
      } else {
        toast.success('Estado atualizado!');
      }

      fetchRooms();
    } catch (e) {
      toast.error('Erro ao atualizar estado');
    }
  };

  const counts = {
    todos: rooms.length,
    disponivel: rooms.filter(r => r.status === 'disponivel').length,
    ocupado: rooms.filter(r => r.status === 'ocupado').length,
    limpeza: rooms.filter(r => r.status === 'limpeza').length,
    manutencao: rooms.filter(r => r.status === 'manutencao').length,
  };

  return (
    <Layout title="Quartos" subtitle={`${rooms.length} quartos no total`}>
      <Toaster position="top-right" />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'disponivel', label: 'Disponível' },
          { key: 'ocupado', label: 'Ocupado' },
          { key: 'limpeza', label: 'Limpeza' },
          { key: 'manutencao', label: 'Manutenção' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === f.key ? '#0071e3' : '#fff',
            color: filter === f.key ? '#fff' : '#1d1d1f',
            fontWeight: filter === f.key ? '600' : '400',
            fontSize: '13px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.15s',
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key]})</span>
          </button>
        ))}
        <button onClick={openCreate} style={{
          marginLeft: 'auto', padding: '8px 20px', borderRadius: '20px',
          border: 'none', cursor: 'pointer', background: '#1d1d1f',
          color: '#fff', fontWeight: '600', fontSize: '13px',
        }}>
          + Novo Quarto
        </button>
      </div>

      {/* Grid de quartos */}
      {loading ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>Nenhum quarto encontrado</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {filtered.map(room => (
            <div key={room.id} style={{
              background: '#fff', borderRadius: '16px', padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
              borderTop: `4px solid ${statusColors[room.status]}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1d1d1f' }}>
                    Quarto {room.number}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#86868b' }}>
                    {typeLabels[room.type]} · Piso {room.floor}
                  </p>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',
                  background: statusColors[room.status] + '20', color: statusColors[room.status],
                }}>
                  {statusLabels[room.status]}
                </span>
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '20px', fontWeight: '700', color: '#0071e3' }}>
                ${room.price_per_night}<span style={{ fontSize: '13px', color: '#86868b', fontWeight: '400' }}>/noite</span>
              </p>

              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: '8px',
                  border: '1.5px solid #e5e5ea', fontSize: '13px', color: '#1d1d1f',
                  background: '#f9f9f9', marginBottom: '12px', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(room)} style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid #e5e5ea',
                  background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#1d1d1f',
                }}>
                  ✏️ Editar
                </button>
                <button onClick={() => handleDelete(room.id)} style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                  background: '#ff453a15', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#ff453a',
                }}>
                  🗑 Apagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '420px', boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              {editRoom ? 'Editar Quarto' : 'Novo Quarto'}
            </h2>

            {[
              { label: 'Número do Quarto *', key: 'number', type: 'text', placeholder: 'ex: 101' },
              { label: 'Piso *', key: 'floor', type: 'number', placeholder: 'ex: 1' },
              { label: 'Preço por Noite (USD) *', key: 'price_per_night', type: 'number', placeholder: 'ex: 80' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #d2d2d7', fontSize: '14px', color: '#1d1d1f',
                    background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Tipo
              </label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px', color: '#1d1d1f',
                  background: '#fafafa', fontFamily: 'inherit',
                }}
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Notas
              </label>
              <textarea
                placeholder="Observações sobre o quarto..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px', color: '#1d1d1f',
                  background: '#fafafa', boxSizing: 'border-box', fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none',
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
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '13px', borderRadius: '12px',
                border: 'none', background: saving ? '#86868b' : '#0071e3',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', color: '#fff',
              }}>
                {saving ? 'A guardar...' : editRoom ? 'Guardar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}