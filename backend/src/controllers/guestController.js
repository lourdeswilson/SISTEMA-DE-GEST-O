const { supabase } = require('../config/database');

// VER TODOS OS HÓSPEDES
const getGuests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*, rooms(number, floor, type)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRIAR HÓSPEDE
const createGuest = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// CHECK-IN
const checkIn = async (req, res) => {
  try {
    // Atualizar hóspede
    const { data: guest, error } = await supabase
      .from('guests')
      .update({ status: 'checked-in', check_in: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar quarto para ocupado
    await supabase
      .from('rooms')
      .update({ status: 'ocupado' })
      .eq('id', guest.room_id);

    // Notificar em tempo real
    const io = req.app.get('io');
    io.emit('guestCheckedIn', guest);
    io.emit('roomUpdated', { roomId: guest.room_id, status: 'ocupado' });

    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CHECK-OUT
const checkOut = async (req, res) => {
  try {
    // Atualizar hóspede
    const { data: guest, error } = await supabase
      .from('guests')
      .update({ status: 'checked-out', check_out: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Atualizar quarto para limpeza
    await supabase
      .from('rooms')
      .update({ status: 'limpeza' })
      .eq('id', guest.room_id);

    // Notificar em tempo real
    const io = req.app.get('io');
    io.emit('guestCheckedOut', guest);
    io.emit('roomUpdated', { roomId: guest.room_id, status: 'limpeza' });

    res.status(200).json({ success: true, data: guest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ATUALIZAR HÓSPEDE
const updateGuest = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('guests')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getGuests, createGuest, checkIn, checkOut, updateGuest };