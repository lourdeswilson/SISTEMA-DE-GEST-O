const { supabase } = require('../config/database');

// VER TODOS OS QUARTOS
const getRooms = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// VER UM QUARTO
const getRoom = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      return res.status(404).json({ success: false, message: 'Quarto não encontrado.' });
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRIAR QUARTO
const createRoom = async (req, res) => {
  try {
    const { number, type, floor, price_per_night, notes } = req.body;

    const { data, error } = await supabase
      .from('rooms')
      .insert([{ number, type, floor, price_per_night, notes }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ATUALIZAR QUARTO
const updateRoom = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Notificar em tempo real
    const io = req.app.get('io');
    io.emit('roomUpdated', data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// APAGAR QUARTO
const deleteRoom = async (req, res) => {
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Quarto apagado.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRooms, getRoom, createRoom, updateRoom, deleteRoom };