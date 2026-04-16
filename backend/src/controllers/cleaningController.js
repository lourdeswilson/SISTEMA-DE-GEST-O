const { supabase } = require('../config/database');

// VER TODOS OS PEDIDOS DE LIMPEZA
const getCleaningRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cleaning_requests')
      .select('*, rooms(number, floor), requested:users!requested_by(name, role), assigned:users!assigned_to(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRIAR PEDIDO DE LIMPEZA
const createCleaningRequest = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cleaning_requests')
      .insert([{ ...req.body, requested_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;

    // Atualizar quarto para limpeza
    await supabase
      .from('rooms')
      .update({ status: 'limpeza' })
      .eq('id', req.body.room_id);

    // Notificar em tempo real
    const io = req.app.get('io');
    io.emit('newCleaningRequest', data);
    io.emit('roomUpdated', { roomId: req.body.room_id, status: 'limpeza' });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ATUALIZAR STATUS
const updateCleaningStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = { status };
    if (status === 'concluido') {
      updateData.completed_at = new Date();
    }

    const { data, error } = await supabase
      .from('cleaning_requests')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Se concluído atualiza quarto para disponível
    if (status === 'concluido') {
      await supabase
        .from('rooms')
        .update({ status: 'disponivel' })
        .eq('id', data.room_id);

      const io = req.app.get('io');
      io.emit('roomUpdated', { roomId: data.room_id, status: 'disponivel' });
    }

    const io = req.app.get('io');
    io.emit('cleaningRequestUpdated', data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCleaningRequests, createCleaningRequest, updateCleaningStatus };