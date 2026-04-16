import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatKz = (value) => new Intl.NumberFormat('pt-AO').format(value) + ' Kz';

const statusColors = {
  disponivel: '#2ec4b6', ocupado: '#e94560',
  reservado: '#ff9f1c', limpeza: '#4361ee', manutencao: '#666'
};

const statusLabels = {
  disponivel: 'Disponível', ocupado: 'Ocupado',
  reservado: 'Reservado', limpeza: 'Limpeza', manutencao: 'Manutenção'
};

export default function Quartos() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ number: '', type: 'normal', floor: '', price_per_night: '', notes: '' });

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data || []);
    } catch { toast.error('Erro ao carregar quartos'); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', { ...form, floor: Number(form.floor), price_per_night: Number(form.price_per_night.replace(/\./g, '')) });
      toast.success('Quarto criado!');
      setShowModal(false);
      setForm({ number: '', type: 'normal', floor: '', price_per_night: '', notes: '' });
      fetchRooms();
    } catch { toast.error('Erro ao criar quarto'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/rooms/${id}`, { status });
      toast.success('Estado actualizado!');
      fetchRooms();
    } catch { toast.error('Erro ao actualizar'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#1a1a2e', fontSize: '24px', fontWeight: '700' }}>🛏️ Quartos</h1>
        <button onClick={() => setShowModal(true)} style={{
          padding: '10px 20px', background: '#4361ee', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
        }}>+ Novo Quarto</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {rooms.map((room) => (
          <div key={room.id} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `4px solid ${statusColors[room.status]}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>Quarto {room.number}</h3>
              <span style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                background: statusColors[room.status] + '20', color: statusColors[room.status]
              }}>{statusLabels[room.status]}</span>
            </div>
            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
              Tipo: <strong>{room.type}</strong> | Piso: <strong>{room.floor}</strong>
            </p>
            <p style={{ margin: '4px 0', color: '#4361ee', fontSize: '16px', fontWeight: '700' }}>
              {formatKz(room.price_per_night)}/noite
            </p>
            <div style={{ marginTop: '12px' }}>
              <select
                value={room.status}
                onChange={(e) => handleStatusChange(room.id, e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
              >
                <option value="disponivel">Disponível</option>
                <option value="ocupado">Ocupado</option>
                <option value="reservado">Reservado</option>
                <option value="limpeza">Limpeza</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px' }}>
            <h2 style={{ margin: '0 0 24px', color: '#1a1a2e' }}>Novo Quarto</h2>
            <form onSubmit={handleSubmit}>
              {[
                { label: 'Número do Quarto', key: 'number', type: 'text', placeholder: 'Ex: 101' },
                { label: 'Piso', key: 'floor', type: 'number', placeholder: 'Ex: 1' },
                { label: 'Preço por Noite (Kz)', key: 'price_per_night', type: 'text', placeholder: 'Ex: 50000' },
              ].map((field) => (
                <div key={field.key} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>{field.label}</label>
                  <input
                    type={field.type} placeholder={field.placeholder} value={form[field.key]}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px' }}>
                  <option value="normal">Normal</option>
                  <option value="especial">Especial</option>
                  <option value="suite">Suite</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '80px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '12px', background: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}>Cancelar</button>
                <button type="submit" style={{
                  flex: 1, padding: '12px', background: '#4361ee', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                }}>Criar Quarto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}