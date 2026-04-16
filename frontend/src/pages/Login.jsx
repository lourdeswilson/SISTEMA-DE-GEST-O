import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Bem-vindo, ${user.name}!`);
      const routes = {
        admin: '/admin',
        rh: '/rh',
        recepcao: '/recepcao',
        limpeza: '/limpeza',
        manutencao: '/manutencao',
      };
      navigate(routes[user.role]);
    } catch (error) {
      toast.error('Email ou password incorretos!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f5f5f7',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <Toaster position="top-center" toastOptions={{
        style: {
          borderRadius: '12px',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: '14px',
        }
      }} />

      {/* Lado esquerdo — imagem/branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #0a0a0a 0%, #1c1c1e 50%, #2c2c2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Círculos decorativos */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />

        {/* Conteúdo esquerdo */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'linear-gradient(135deg, #0071e3, #00c6ff)',
            borderRadius: '22px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 28px',
            boxShadow: '0 20px 60px rgba(0, 113, 227, 0.4)',
          }}>
            🏨
          </div>
          <h1 style={{
            fontSize: '42px', fontWeight: '700',
            color: '#ffffff', margin: '0 0 12px',
            letterSpacing: '-1px',
          }}>
            So Victoria
          </h1>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.5)',
            margin: '0 0 48px', fontWeight: '400',
          }}>
            Sistema de Gestão Hoteleira
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
            {[
              { value: '10', label: 'Quartos' },
              { value: '5', label: 'Equipas' },
              { value: '24/7', label: 'Operacional' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
        background: '#ffffff',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* Cabeçalho */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '28px', fontWeight: '700',
              color: '#1d1d1f', margin: '0 0 8px',
              letterSpacing: '-0.5px',
            }}>
              Iniciar sessão
            </h2>
            <p style={{ fontSize: '15px', color: '#86868b', margin: 0 }}>
              Bem-vindo de volta ao So Victoria
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '600', color: '#1d1d1f',
                marginBottom: '8px', letterSpacing: '0.2px',
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@sovictoria.com"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1.5px solid #d2d2d7',
                  borderRadius: '12px', fontSize: '15px',
                  color: '#1d1d1f', background: '#fafafa',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0071e3'}
                onBlur={(e) => e.target.style.borderColor = '#d2d2d7'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '13px',
                fontWeight: '600', color: '#1d1d1f',
                marginBottom: '8px',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1.5px solid #d2d2d7',
                  borderRadius: '12px', fontSize: '15px',
                  color: '#1d1d1f', background: '#fafafa',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = '#0071e3'}
                onBlur={(e) => e.target.style.borderColor = '#d2d2d7'}
              />
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#86868b' : '#0071e3',
                color: 'white', border: 'none',
                borderRadius: '12px', fontSize: '15px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                fontFamily: 'inherit',
                letterSpacing: '0.2px',
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.background = '#0077ed' }}
              onMouseLeave={(e) => { if (!loading) e.target.style.background = '#0071e3' }}
            >
              {loading ? 'A entrar...' : 'Entrar →'}
            </button>
          </form>

          {/* Footer */}
          <p style={{
            textAlign: 'center', fontSize: '12px',
            color: '#86868b', marginTop: '40px',
          }}>
            © 2024 So Victoria · Gestão Hoteleira
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;