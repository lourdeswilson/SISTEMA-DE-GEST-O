const { pool } = require('../config/database');

const getAllGuests = async () => {
  const result = await pool.query(
    `SELECT g.*, r.number as room_number, r.type as room_type
     FROM guests g LEFT JOIN rooms r ON g.room_id = r.id
     ORDER BY g.created_at DESC`
  );
  return result.rows;
};

const getGuestById = async (id) => {
  const result = await pool.query(
    `SELECT g.*, r.number as room_number FROM guests g
     LEFT JOIN rooms r ON g.room_id = r.id WHERE g.id = $1`,
    [id]
  );
  return result.rows[0];
};

const createGuest = async (data) => {
  const { first_name, last_name, email, phone, document_id, nationality, room_id, check_in, check_out, notes } = data;
  const result = await pool.query(
    `INSERT INTO guests (first_name, last_name, email, phone, document_id, nationality, room_id, check_in, check_out, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [first_name, last_name, email, phone, document_id, nationality, room_id, check_in, check_out, notes]
  );
  return result.rows[0];
};

const updateGuest = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE guests SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest };