import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const roleMenus = {
  admin: [
    { section: 'Principal', items: [
      { icon: '◼', label: 'Dashboard', path: '/admin' },
    ]},
    { section: 'Gestão', items: [
      { icon: '🛏', label: 'Quartos', path: '/admin/quartos' },
      { icon: '👥', label: 'Hóspedes', path: '/admin/hospedes' },
      { icon: '💳', label: 'Faturação', path: '/admin/faturacao' },
      { icon: '🧹', label: 'Limpeza', path: '/admin/limpeza' },
      { icon: '🔧', label: 'Manutenção', path: '/admin/manutencao' },
    ]},
  ],
  recepcao: [
    { section: 'Principal', items: [
      { icon: '◼', label: 'Dashboard', path: '/recepcao' },
      { icon: '🛏', label: 'Quartos', path: '/recepcao/quartos' },
      { icon: '👥', label: 'Hóspedes', path: '/recepcao/hospedes' },
    ]},
    { section: 'Pedidos', items: [
      { icon: '🧹', label: 'Pedir Limpeza', path: '/recepcao/limpeza' },
      { icon: '🔧', label: 'Pedir Manutenção', path: '/recepcao/manutencao' },
    ]},
  ],
  limpeza: [
    { section: 'Principal', items: [
      { icon: '🧹', label: 'Pedidos', path: '/limpeza' },
    ]},
  ],
  manutencao: [
    { section: 'Principal', items: [
      { icon: '🔧', label: 'Pedidos', path: '/manutencao' },
    ]},
  ],
  rh: [
    { section: 'Principal', items: [
      { icon: '◼', label: 'Dashboard', path: '/rh' },
      { icon: '👔', label: 'Funcionários', path: '/rh/funcionarios' },
    ]},
  ],
};

const roleLabels = {
  admin: 'Administrador', recepcao: 'Receção',
  limpeza: 'Limpeza', manutencao: 'Manutenção', rh: 'Recursos Humanos',
};

export default function Layout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menus = roleMenus[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div style={{
        padding: '24px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          width: '38px', height: '38px',
          background: 'linear-gradient(135deg,#0071e3,#00c6ff)',
          borderRadius: '10px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', marginBottom: '8px',
        }}>🏨</div>
        <p style={{ color: '#fff', fontSize: '16px', fontWeight: '700', margin: 0 }}>So Victoria</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '2px 0 0' }}>Gestão Hoteleira</p>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', overflowY: 'auto' }}>
        {menus.map(section => (
          <div key={section.section} style={{ marginBottom: '20px' }}>
            <p style={{
              color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '600',
              letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 6px 10px',
            }}>
              {section.section}
            </p>
            {section.items.map(item => {
              const active = location.pathname === item.path;
              return (
                <button key={item.path} onClick={() => handleNav(item.path)} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                  background: active ? 'rgba(0,113,227,0.25)' : 'transparent',
                  color: active ? '#0071e3' : 'rgba(255,255,255,0.7)',
                  fontSize: '14px', fontWeight: active ? '600' : '400',
                  transition: 'all 0.15s', marginBottom: '2px',
                  border: 'none', width: '100%', textAlign: 'left',
                  fontFamily: 'inherit',
                }}>
                  <span style={{ fontSize: '15px', width: '20px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: 'linear-gradient(135deg,#0071e3,#00c6ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: '1px 0 0' }}>
            {roleLabels[user?.role]}
          </p>
        </div>
        <button onClick={handleLogout} title="Sair" style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
          fontSize: '18px', padding: '4px', flexShrink: 0,
        }}>⏻</button>
      </div>
    </>
  );

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
      background: '#f2f2f7',
    }}>
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .topbar-mobile { display: flex !important; }
          .main-content { margin-left: 0 !important; padding: 70px 16px 24px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .rooms-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Sidebar Desktop */}
      <aside className="sidebar-desktop" style={{
        width: '230px', background: '#1c1c1e',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
      }}>
        <SidebarContent />
      </aside>

      {/* Topbar Mobile */}
      <div className="topbar-mobile" style={{
        display: 'none',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: '#1c1c1e', padding: '14px 16px',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🏨</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px' }}>So Victoria</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: 'none', border: 'none', color: '#fff',
          fontSize: '22px', cursor: 'pointer', padding: '4px',
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Drawer Mobile */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 299, backdropFilter: 'blur(2px)',
          }} />
          <aside style={{
            position: 'fixed', top: 0, left: 0, height: '100vh',
            width: '260px', background: '#1c1c1e', zIndex: 300,
            display: 'flex', flexDirection: 'column',
          }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Conteúdo principal */}
      <main className="main-content" style={{
        marginLeft: '230px', flex: 1,
        padding: '32px', minHeight: '100vh',
      }}>
        {(title || subtitle) && (
          <div style={{ marginBottom: '28px' }}>
            {title && (
              <h1 style={{
                fontSize: '26px', fontWeight: '700', color: '#1d1d1f',
                margin: 0, letterSpacing: '-0.5px',
              }}>{title}</h1>
            )}
            {subtitle && (
              <p style={{ fontSize: '14px', color: '#86868b', margin: '4px 0 0' }}>{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}