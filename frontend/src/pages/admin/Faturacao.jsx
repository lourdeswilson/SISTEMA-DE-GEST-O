import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  pendente: '#ff9f0a', parcial: '#0071e3',
  pago: '#30d158', divida: '#ff453a',
};
const statusLabels = {
  pendente: 'Pendente', parcial: 'Parcial',
  pago: 'Pago', divida: 'Dívida',
};

export default function Faturacao() {
  const [payments, setPayments] = useState([]);
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [form, setForm] = useState({
    guest_id: '', room_id: '', nights: 1,
    check_in_date: '', check_out_date: '', notes: ''
  });

  const fetchAll = async () => {
    try {
      const [p, g, r] = await Promise.all([
        api.get('/payments'),
        api.get('/guests'),
        api.get('/rooms'),
      ]);
      setPayments(p.data.data || []);
      setGuests(g.data.data || []);
      setRooms(r.data.data || []);
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'todos' ? payments : payments.filter(p => p.status === filter);

  // Calcula total automaticamente quando muda quarto ou noites
  const getTotal = () => {
    const room = rooms.find(r => r.id === form.room_id);
    if (!room || !form.nights) return 0;
    return parseFloat(room.price_per_night) * parseInt(form.nights);
  };

  const handleCreate = async () => {
    if (!form.guest_id || !form.room_id || !form.nights) {
      toast.error('Hóspede, quarto e noites são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await api.post('/payments', {
        ...form,
        total_amount: getTotal(),
      });
      toast.success('Fatura criada!');
      setShowModal(false);
      setForm({ guest_id: '', room_id: '', nights: 1, check_in_date: '', check_out_date: '', notes: '' });
      fetchAll();
    } catch (e) {
      toast.error('Erro ao criar fatura');
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async () => {
    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error('Insere um valor válido');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/payments/${selectedPayment.id}/pagar`, { amount: payAmount });
      toast.success('Pagamento registado!');
      setShowPayModal(false);
      setPayAmount('');
      fetchAll();
    } catch (e) {
      toast.error('Erro ao registar pagamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDebt = async (id) => {
    if (!confirm('Marcar como dívida?')) return;
    try {
      await api.put(`/payments/${id}/divida`);
      toast.success('Marcado como dívida!');
      fetchAll();
    } catch (e) {
      toast.error('Erro ao atualizar');
    }
  };

  const counts = {
    todos: payments.length,
    pendente: payments.filter(p => p.status === 'pendente').length,
    parcial: payments.filter(p => p.status === 'parcial').length,
    pago: payments.filter(p => p.status === 'pago').length,
    divida: payments.filter(p => p.status === 'divida').length,
  };

  const totalDivida = payments
    .filter(p => p.status === 'divida' || p.status === 'parcial' || p.status === 'pendente')
    .reduce((acc, p) => acc + (parseFloat(p.total_amount) - parseFloat(p.amount_paid)), 0);

  return (
    <Layout title="Faturação" subtitle="Controlo de pagamentos e dívidas">
      <Toaster position="top-right" />

      {/* Cards de resumo */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Faturas', value: counts.todos, color: '#0071e3', icon: '📋' },
          { label: 'Pagas', value: counts.pago, color: '#30d158', icon: '✅' },
          { label: 'Pendentes', value: counts.pendente + counts.parcial, color: '#ff9f0a', icon: '⏳' },
          { label: 'Em Dívida', value: `$${totalDivida.toFixed(2)}`, color: '#ff453a', icon: '⚠️' },
        ].map(card => (
          <div key={card.label} style={{
            background: '#fff', borderRadius: '16px', padding: '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: card.color + '18', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', color: '#86868b', fontWeight: '500' }}>{card.label}</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1d1d1f' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'pendente', label: 'Pendente' },
          { key: 'parcial', label: 'Parcial' },
          { key: 'pago', label: 'Pago' },
          { key: 'divida', label: 'Dívida' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            background: filter === f.key ? '#0071e3' : '#fff',
            color: filter === f.key ? '#fff' : '#1d1d1f',
            fontWeight: filter === f.key ? '600' : '400',
            fontSize: '13px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            {f.label} <span style={{ opacity: 0.7 }}>({counts[f.key] ?? payments.length})</span>
          </button>
        ))}
        <button onClick={() => setShowModal(true)} style={{
          marginLeft: 'auto', padding: '8px 20px', borderRadius: '20px',
          border: 'none', cursor: 'pointer', background: '#1d1d1f',
          color: '#fff', fontWeight: '600', fontSize: '13px',
        }}>
          + Nova Fatura
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <p style={{ color: '#86868b', margin: 0 }}>Nenhuma fatura encontrada</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(p => {
            const remaining = parseFloat(p.total_amount) - parseFloat(p.amount_paid);
            return (
              <div key={p.id} style={{
                background: '#fff', borderRadius: '14px', padding: '18px 24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                borderLeft: `4px solid ${statusColors[p.status]}`,
              }}>
                {/* Avatar */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#0071e3,#00c6ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: '700', fontSize: '16px', flexShrink: 0,
                }}>
                  {p.guests?.first_name?.charAt(0).toUpperCase()}
                </div>

                {/* Info hóspede */}
                <div style={{ flex: 1, minWidth: '150px' }}>
                  <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
                    {p.guests?.first_name} {p.guests?.last_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#86868b' }}>
                    🛏 Quarto {p.rooms?.number} · {p.nights} noite{p.nights > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Valores */}
                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <p style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '700', color: '#1d1d1f' }}>
                    ${parseFloat(p.total_amount).toFixed(2)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: remaining > 0 ? '#ff453a' : '#30d158' }}>
                    {remaining > 0 ? `Falta $${remaining.toFixed(2)}` : '✅ Pago'}
                  </p>
                </div>

                {/* Status */}
                <span style={{
                  padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                  background: statusColors[p.status] + '20', color: statusColors[p.status],
                  minWidth: '80px', textAlign: 'center',
                }}>
                  {statusLabels[p.status]}
                </span>

                {/* Ações */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {p.status !== 'pago' && (
                    <button onClick={() => { setSelectedPayment(p); setShowPayModal(true); }} style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: '#30d15820', color: '#30d158',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    }}>
                      💰 Pagar
                    </button>
                  )}
                  {(p.status === 'pendente' || p.status === 'parcial') && (
                    <button onClick={() => handleDebt(p.id)} style={{
                      padding: '8px 14px', borderRadius: '8px', border: 'none',
                      background: '#ff453a20', color: '#ff453a',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                    }}>
                      ⚠️ Dívida
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nova fatura */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '440px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              Nova Fatura
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Hóspede *
              </label>
              <select
                value={form.guest_id}
                onChange={e => setForm({ ...form, guest_id: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px', fontFamily: 'inherit',
                }}
              >
                <option value="">Seleciona hóspede</option>
                {guests.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.first_name} {g.last_name} — {g.document_id}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
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
                <option value="">Seleciona quarto</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Quarto {r.number} — ${r.price_per_night}/noite
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Número de Noites *
              </label>
              <input
                type="number" min="1"
                value={form.nights}
                onChange={e => setForm({ ...form, nights: e.target.value })}
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '14px',
                  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>

            {/* Total calculado automaticamente */}
            {getTotal() > 0 && (
              <div style={{
                background: '#f2f2f7', borderRadius: '12px', padding: '14px 16px',
                marginBottom: '14px', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '14px', color: '#86868b' }}>Total calculado:</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#0071e3' }}>
                  ${getTotal().toFixed(2)}
                </span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                  Check-in
                </label>
                <input
                  type="date"
                  value={form.check_in_date}
                  onChange={e => setForm({ ...form, check_in_date: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #d2d2d7', fontSize: '14px',
                    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                  Check-out
                </label>
                <input
                  type="date"
                  value={form.check_out_date}
                  onChange={e => setForm({ ...form, check_out_date: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #d2d2d7', fontSize: '14px',
                    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Notas
              </label>
              <textarea
                placeholder="Observações..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
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
                {saving ? 'A guardar...' : 'Criar Fatura'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal registar pagamento */}
      {showPayModal && selectedPayment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '380px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              Registar Pagamento
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#86868b' }}>
              {selectedPayment.guests?.first_name} {selectedPayment.guests?.last_name}
            </p>

            <div style={{
              background: '#f2f2f7', borderRadius: '12px', padding: '14px 16px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#86868b' }}>Total:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1d1d1f' }}>
                  ${parseFloat(selectedPayment.total_amount).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#86868b' }}>Já pago:</span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#30d158' }}>
                  ${parseFloat(selectedPayment.amount_paid).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#86868b' }}>Falta pagar:</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#ff453a' }}>
                  ${(parseFloat(selectedPayment.total_amount) - parseFloat(selectedPayment.amount_paid)).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                Valor a pagar agora ($)
              </label>
              <input
                type="number" min="0"
                placeholder="ex: 50.00"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                style={{
                  width: '100%', padding: '14px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '18px', fontWeight: '600',
                  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                  textAlign: 'center', color: '#0071e3',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowPayModal(false); setPayAmount(''); }} style={{
                flex: 1, padding: '13px', borderRadius: '12px',
                border: '1.5px solid #e5e5ea', background: '#fff',
                cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1d1d1f',
              }}>
                Cancelar
              </button>
              <button onClick={handlePay} disabled={saving} style={{
                flex: 1, padding: '13px', borderRadius: '12px', border: 'none',
                background: saving ? '#86868b' : '#30d158',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', color: '#fff',
              }}>
                {saving ? 'A guardar...' : '💰 Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}