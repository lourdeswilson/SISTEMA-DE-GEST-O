import { useState, useEffect } from 'react';
import api from '../../services/api';

const formatKz = (value) => new Intl.NumberFormat('pt-AO').format(value) + ' Kz';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ rooms: 0, guests: 0, available: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [roomsRes, guestsRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/guests'),
        ]);
        const rooms = roomsRes.data.data || [];
        const guests = guestsRes.data.data || [];
        const available = rooms.filter(r => r.status === 'disponivel').length;
        setStats({ rooms: rooms.length, guests: guests.length, available, revenue: 0 });
      } catch {}
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total de Quartos', value: stats.rooms, icon: '🛏️', color: '#4361ee' },
    { label: 'Quartos Disponíveis', value: stats.available, icon: '✅', color: '#2ec4b6' },
    { label: 'Hóspedes Activos', value: stats.guests, icon: '👥', color: '#ff9f1c' },
    { label: 'Receita do Mês', value: formatKz(stats.revenue), icon: '💰', color: '#e94560' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 8px', color: '#1a1a2e', fontSize: '24px', fontWeight: '700' }}>
        Dashboard
      </h1>
      <p style={{ color: '#666', margin: '0 0 32px' }}>Bem-vindo ao sistema de gestão</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            background: 'white', borderRadius: '12px', padding: '24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{card.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>{card.value}</div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}