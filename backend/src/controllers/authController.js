const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar se email e password foram enviados
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e password são obrigatórios.',
      });
    }

    // 2. Procurar utilizador pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    // 3. Verificar password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.',
      });
    }

    // 4. Gerar token e responder
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no servidor.',
      error: error.message,
    });
  }
};

// VER PERFIL DO UTILIZADOR LOGADO
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = { login, getMe };
