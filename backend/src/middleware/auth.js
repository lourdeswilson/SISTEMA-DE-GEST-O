const jwt = require('jsonwebtoken');
const { findUserById } = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Não autorizado' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await findUserById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

module.exports = { protect };