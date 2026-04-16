import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const menuItems = [
  { path: '/', label: '📊 Dashboard', exact: true },
  { path: '/quartos', label: '🛏️ Quartos' },
  { path: '/hospedes', label: '👥 Hóspedes' },
  { path: '/limpeza', label: '🧹 Limpeza' },
  { path: '/manutencao', label: '🔧 Manutenção' },
  { path: '/faturacao', label: '💰 Faturação' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sessão terminada');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px', background: 'linear-gradient(180deg, #1a1a2e 0%, #0f3460 100%)',
        display: 'flex', flexDirection: 'column', padding: '0', position: 'fixed',
        height: '100vh', zIndex: 100
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '24px', textAlign: 'center' }}>🏨</div>
          <h2 style={{ color: 'white', margin: '8px 0 4px', fontSize: '14px', textAlign: 'center', fontWeight: '700' }}>
            Residencial Só Victoria
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '11px', textAlign: 'center' }}>
            {user?.role?.toUpperCase()}
          </p>
        </div>

        <nav style={{ flex: 1, padding: '16px 0' }}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path} to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'block', padding: '12px 20px', color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? '600' : '400',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
                transition: 'all 0.2s'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 8px', fontSize: '13px' }}>
            👤 {user?.name}
          </p>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '10px', background: '#e94560',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{ marginLeft: '250px', flex: 1, padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  );
}