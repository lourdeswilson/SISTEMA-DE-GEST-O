import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../services/api';
import toast, { Toaster } from 'react-hot-toast';

const statusColors = {
  reservado: '#ffd60a',
  'checked-in': '#30d158',
  'checked-out': '#86868b',
};

const statusLabels = {
  reservado: 'Reservado',
  'checked-in': 'Check-in',
  'checked-out': 'Check-out',
};

export default function Hospedes() {
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    phone: '', document_id: '', room_id: '', notes: ''
  });

  const fetchAll = async () => {
    try {
      const [g, r] = await Promise.all([
        api.get('/guests'),
        api.get('/rooms'),
      ]);
      setGuests(g.data.data || []);
      setRooms(r.data.data || []);
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = filter === 'todos' ? guests : guests.filter(g => g.status === filter);

  const handleCreate = async () => {
    if (!form.first_name || !form.last_name || !form.document_id) {
      toast.error('Nome, apelido e documento são obrigatórios');
      return;
    }
    setSaving(true);
    try {
      await api.post('/guests', form);
      toast.success('Hóspede registado!');
      setShowModal(false);
      setForm({ first_name: '', last_name: '', email: '', phone: '', document_id: '', room_id: '', notes: '' });
      fetchAll();
    } catch (e) {
      toast.error('Erro ao registar hóspede');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await api.put(`/guests/${id}/checkin`);
      toast.success('Check-in feito!');
      fetchAll();
    } catch (e) {
      toast.error('Erro no check-in');
    }
  };

  const handleCheckOut = async (id) => {
    if (!confirm('Confirmas o check-out deste hóspede?')) return;
    try {
      await api.put(`/guests/${id}/checkout`);
      toast.success('Check-out feito!');
      fetchAll();
    } catch (e) {
      toast.error('Erro no check-out');
    }
  };

  const counts = {
    todos: guests.length,
    reservado: guests.filter(g => g.status === 'reservado').length,
    'checked-in': guests.filter(g => g.status === 'checked-in').length,
    'checked-out': guests.filter(g => g.status === 'checked-out').length,
  };

  const availableRooms = rooms.filter(r => r.status === 'disponivel' || r.status === 'reservado');

  return (
    <Layout title="Hóspedes" subtitle={`${guests.length} hóspedes registados`}>
      <Toaster position="top-right" />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'reservado', label: 'Reservados' },
          { key: 'checked-in', label: 'Check-in' },
          { key: 'checked-out', label: 'Check-out' },
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
        <button onClick={() => setShowModal(true)} style={{
          marginLeft: 'auto', padding: '8px 20px', borderRadius: '20px',
          border: 'none', cursor: 'pointer', background: '#1d1d1f',
          color: '#fff', fontWeight: '600', fontSize: '13px',
        }}>
          + Novo Hóspede
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <p style={{ color: '#86868b', textAlign: 'center', padding: '60px' }}>A carregar...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: '#86868b', margin: 0 }}>Nenhum hóspede encontrado</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(guest => (
            <div key={guest.id} style={{
              background: '#fff', borderRadius: '14px', padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '20px',
            }}>
              {/* Avatar */}
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #0071e3, #00c6ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: '700', fontSize: '18px', flexShrink: 0,
              }}>
                {guest.first_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '600', color: '#1d1d1f' }}>
                  {guest.first_name} {guest.last_name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#86868b' }}>
                  📄 {guest.document_id}
                  {guest.phone && ` · 📞 ${guest.phone}`}
                  {guest.rooms && ` · 🛏 Quarto ${guest.rooms.number}`}
                </p>
              </div>

              {/* Datas */}
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                {guest.check_in && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#86868b' }}>
                    IN: {new Date(guest.check_in).toLocaleDateString('pt-PT')}
                  </p>
                )}
                {guest.check_out && (
                  <p style={{ margin: 0, fontSize: '11px', color: '#86868b' }}>
                    OUT: {new Date(guest.check_out).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>

              {/* Status */}
              <span style={{
                padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                background: statusColors[guest.status] + '20',
                color: statusColors[guest.status],
                minWidth: '90px', textAlign: 'center',
              }}>
                {statusLabels[guest.status]}
              </span>

              {/* Ações */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {guest.status === 'reservado' && (
                  <button onClick={() => handleCheckIn(guest.id)} style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#30d15820', color: '#30d158',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>
                    ✅ Check-in
                  </button>
                )}
                {guest.status === 'checked-in' && (
                  <button onClick={() => handleCheckOut(guest.id)} style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                    background: '#ff453a20', color: '#ff453a',
                    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>
                    🚪 Check-out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo hóspede */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '32px',
            width: '100%', maxWidth: '460px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '700', color: '#1d1d1f' }}>
              Registar Hóspede
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { label: 'Nome *', key: 'first_name', placeholder: 'João' },
                { label: 'Apelido *', key: 'last_name', placeholder: 'Silva' },
                { label: 'Email', key: 'email', placeholder: 'joao@email.com' },
                { label: 'Telefone', key: 'phone', placeholder: '+244 9xx xxx xxx' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1d1d1f', marginBottom: '5px' }}>
                    {f.label}
                  </label>
                  <input
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px',
                      border: '1.5px solid #d2d2d7', fontSize: '13px',
                      boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1d1d1f', marginBottom: '5px' }}>
                Nº Documento (BI/Passaporte) *
              </label>
              <input
                placeholder="ex: 005123456LA041"
                value={form.document_id}
                onChange={e => setForm({ ...form, document_id: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '13px',
                  boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1d1d1f', marginBottom: '5px' }}>
                Quarto
              </label>
              <select
                value={form.room_id}
                onChange={e => setForm({ ...form, room_id: e.target.value })}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '13px',
                  fontFamily: 'inherit', background: '#fff',
                }}
              >
                <option value="">Sem quarto atribuído</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>
                    Quarto {r.number} — {r.type} · Piso {r.floor} · ${r.price_per_night}/noite
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1d1d1f', marginBottom: '5px' }}>
                Notas
              </label>
              <textarea
                placeholder="Observações..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '10px',
                  border: '1.5px solid #d2d2d7', fontSize: '13px',
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
                flex: 1, padding: '13px', borderRadius: '12px',
                border: 'none', background: saving ? '#86868b' : '#0071e3',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', color: '#fff',
              }}>
                {saving ? 'A guardar...' : 'Registar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}