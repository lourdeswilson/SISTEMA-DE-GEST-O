const { supabase } = require('../config/database');

// VER TODOS OS PAGAMENTOS
const getPayments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, guests(first_name, last_name, document_id), rooms(number, floor, type)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CRIAR PAGAMENTO (quando faz check-in)
const createPayment = async (req, res) => {
  try {
    const { guest_id, room_id, total_amount, check_in_date, check_out_date, nights, notes } = req.body;

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        guest_id,
        room_id,
        total_amount,
        amount_paid: 0,
        check_in_date,
        check_out_date,
        nights,
        status: 'pendente',
        notes,
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// REGISTAR PAGAMENTO
const registerPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError) throw fetchError;

    const newAmountPaid = parseFloat(payment.amount_paid) + parseFloat(amount);
    const remaining = parseFloat(payment.total_amount) - newAmountPaid;

    let status = 'parcial';
    if (remaining <= 0) status = 'pago';
    else if (newAmountPaid === 0) status = 'pendente';

    const { data, error } = await supabase
      .from('payments')
      .update({
        amount_paid: newAmountPaid,
        status,
        updated_at: new Date(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// MARCAR COMO DÍVIDA
const markAsDebt = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .update({ status: 'divida', updated_at: new Date() })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPayments, createPayment, registerPayment, markAsDebt };