const Room = require('../models/Room');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.getAllRooms();
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRoom = async (req, res) => {
  try {
    const room = await Room.getRoomById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Quarto não encontrado' });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const { number, type, floor, price_per_night, notes } = req.body;
    const room = await Room.createRoom(number, type, floor, price_per_night, notes || '');
    const io = req.app.get('io');
    io.emit('roomCreated', room);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const room = await Room.updateRoom(req.params.id, req.body);
    const io = req.app.get('io');
    io.emit('roomUpdated', room);
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await Room.deleteRoom(req.params.id);
    res.json({ success: true, message: 'Quarto apagado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom };