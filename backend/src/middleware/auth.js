const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');

const protect = async (req, res, next) => {
  try {
    // 1. Verificar se o token existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Fazes login primeiro.',
      });
    }

    // 2. Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Buscar o utilizador na base de dados
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('id', decoded.id)
      .single();

    if (error || !user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Utilizador não encontrado ou inativo.',
      });
    }

    // 4. Adicionar o utilizador ao request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado.',
    });
  }
};

module.exports = { protect };