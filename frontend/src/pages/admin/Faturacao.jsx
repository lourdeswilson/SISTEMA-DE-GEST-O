import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatKz = (value) => new Intl.NumberFormat('pt-AO').format(value) + ' Kz';

const statusColors = { pendente: '#ff9f1c', parcial: '#4361ee', pago: '#2ec4b6', divida: '#e94560' };
const statusLabels = { pendente: 'Pendente', parcial: 'Parcial', pago: 'Pago', divida: 'Dívida' };

export default function Faturacao() {
  const [payments, setPayments] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ guest_id: '', room_id: '', nights: 1, notes: '' });

  const fetchAll = async () => {
    try {
      const [p, g, r] = await Promise.all([
        api.get('/payments'), api.get('/guests'), api.get('/rooms'),
      ]);
      setPayments(p.data.data || []);
      setGuests(g.data.data || []);
      setRooms(r.data.data || []);
    } catch { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const getTotal = () => {
    const room = rooms.find(r => String(r.id) === String(form.room_id));
    if (!room || !form.nights) return 0;
    return parseFloat(room.price_per_night) * parseInt(form.nights);
  };

  const handleCreate = async () => {
    if (!form.guest_id || !form.room_id || !form.nights) {
      toast.error('Hóspede, quarto e noites são obrigatórios'); return;
    }
    setSaving(true);
    try {
      await api.post('/payments', { ...form, total_amount: getTotal() });
      toast.success('Fatura criada!');
      setShowModal(false);
      setForm({ guest_id: '', room_id: '', nights: 1, notes: '' });
      fetchAll();
    } catch { toast.error('Erro ao criar fatura'); }
    finally { setSaving(false); }
  };

  const filtered = filter === 'todos' ? payments : payments.filter(p => p.status === filter);

  const totalDivida = payments
    .filter(p => ['divida','parcial','pendente'].includes(p.status))
    .reduce((acc, p) => acc + (parseFloat(p.total_amount || 0) - parseFloat(p.amount_paid || 0)), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1a1a2e', fontSize: '24px', fontWeight: '700' }}>💰 Faturação</h1>
        <button onClick={() => setShowModal(true)} style={{
          padding: '10px 20px', background: '#4361ee', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
        }}>+ Nova Fatura</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Faturas', value: payments.length, color: '#4361ee', icon: '📋' },
          { label: 'Pagas', value: payments.filter(p => p.status === 'pago').length, color: '#2ec4b6', icon: '✅' },
          { label: 'Pendentes', value: payments.filter(p => p.status === 'pendente').length, color: '#ff9f1c', icon: '⏳' },
          { label: 'Em Dívida', value: formatKz(totalDivida), color: '#e94560', icon: '⚠️' },
        ].map(card => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '24px' }}>{card.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: card.color, margin: '8px 0 4px' }}>{card.value}</div>
            <div style={{ color: '#666', fontSize: '13px' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['todos','pendente','parcial','pago','divida'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === f ? '#4361ee' : 'white', color: filter === f ? 'white' : '#333',
            fontWeight: filter === f ? '600' : '400', fontSize: '13px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#666' }}>A carregar...</p> :
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
            <div style={{ fontSize: '48px' }}>💳</div>
            <p style={{ color: '#666' }}>Nenhuma fatura encontrada</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(p => (
              <div key={p.id} style={{
                background: 'white', borderRadius: '12px', padding: '18px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: `4px solid ${statusColors[p.status] || '#ccc'}`,
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '15px', color: '#1a1a2e' }}>
                    {p.guests?.first_name} {p.guests?.last_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    Quarto {p.rooms?.number} · {p.nights} noite(s)
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
                    {formatKz(p.total_amount || 0)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                    Pago: {formatKz(p.amount_paid || 0)}
                  </p>
                </div>
                <span style={{
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                  background: (statusColors[p.status] || '#ccc') + '20', color: statusColors[p.status] || '#ccc'
                }}>{statusLabels[p.status] || p.status}</span>
              </div>
            ))}
          </div>
        )
      }

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '440px' }}>
            <h2 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Nova Fatura</h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Hóspede *</label>
              <select value={form.guest_id} onChange={e => setForm({ ...form, guest_id: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}>
                <option value="">Seleciona hóspede</option>
                {guests.map(g => <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Quarto *</label>
              <select value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}>
                <option value="">Seleciona quarto</option>
                {rooms.map(r => <option key={r.id} value={r.id}>Quarto {r.number} — {formatKz(r.price_per_night)}/noite</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Número de Noites *</label>
              <input type="number" min="1" value={form.nights}
                onChange={e => setForm({ ...form, nights: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            {getTotal() > 0 && (
              <div style={{ background: '#f0f4ff', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#666' }}>Total:</span>
                <span style={{ fontWeight: '700', color: '#4361ee', fontSize: '18px' }}>{formatKz(getTotal())}</span>
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>Notas</label>
              <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px', boxSizing: 'border-box', minHeight: '70px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '12px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}>Cancelar</button>
              <button onClick={handleCreate} disabled={saving} style={{
                flex: 1, padding: '12px', background: saving ? '#ccc' : '#4361ee', color: 'white',
                border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600'
              }}>{saving ? 'A guardar...' : 'Criar Fatura'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}