const { supabase } = require('../config/database');

// VER TODOS OS PEDIDOS DE MANUTENÇÃO
const getMaintenanceRequests = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .select('*, rooms(number, floor), requested:users!requested_by(name, role), assigned:users!assigned_to(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRIAR PEDIDO DE MANUTENÇÃO
const createMaintenanceRequest = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert([{ ...req.body, requested_by: req.user.id }])
      .select()
      .single();

    if (error) throw error;

    // Atualizar quarto para manutenção
    await supabase
      .from('rooms')
      .update({ status: 'manutencao' })
      .eq('id', req.body.room_id);

    // Notificar em tempo real
    const io = req.app.get('io');
    io.emit('newMaintenanceRequest', data);
    io.emit('roomUpdated', { roomId: req.body.room_id, status: 'manutencao' });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ATUALIZAR STATUS
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updateData = { status };
    if (status === 'resolvido') {
      updateData.resolved_at = new Date();
    }

    const { data, error } = await supabase
      .from('maintenance_requests')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Se resolvido atualiza quarto para disponível
    if (status === 'resolvido') {
      await supabase
        .from('rooms')
        .update({ status: 'disponivel' })
        .eq('id', data.room_id);

      const io = req.app.get('io');
      io.emit('roomUpdated', { roomId: data.room_id, status: 'disponivel' });
    }

    const io = req.app.get('io');
    io.emit('maintenanceRequestUpdated', data);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceStatus };