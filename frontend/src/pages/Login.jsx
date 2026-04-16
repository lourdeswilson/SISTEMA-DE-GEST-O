import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
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
      navigate('/');
    } catch {
      toast.error('Email ou password incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '48px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px' }}>🏨</div>
          <h1 style={{ margin: '8px 0 4px', color: '#1a1a2e', fontSize: '24px', fontWeight: '700' }}>
            Residencial Só Victoria
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>Sistema de Gestão</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Email
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="o_teu@email.com"
              style={{
                width: '100%', padding: '12px', border: '2px solid #e0e0e0',
                borderRadius: '8px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box', transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
              Password
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required placeholder="••••••••"
              style={{
                width: '100%', padding: '12px', border: '2px solid #e0e0e0',
                borderRadius: '8px', fontSize: '14px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '14px', background: loading ? '#ccc' : 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}