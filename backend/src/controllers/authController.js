const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail, comparePassword } = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ success: false, message: 'Email já existe' });
    const user = await createUser(name, email, password, role);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Email ou password incorrectos' });
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Email ou password incorrectos' });
    if (!user.is_active) return res.status(401).json({ success: false, message: 'Conta desactivada' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login };