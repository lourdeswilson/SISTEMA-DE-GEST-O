const { pool } = require('../config/database');

const getAllRooms = async () => {
  const result = await pool.query('SELECT * FROM rooms ORDER BY number ASC');
  return result.rows;
};

const getRoomById = async (id) => {
  const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
  return result.rows[0];
};

const createRoom = async (number, type, floor, price_per_night, notes) => {
  const result = await pool.query(
    `INSERT INTO rooms (number, type, floor, price_per_night, notes)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [number, type, floor, price_per_night, notes]
  );
  return result.rows[0];
};

const updateRoom = async (id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const result = await pool.query(
    `UPDATE rooms SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );
  return result.rows[0];
};

const deleteRoom = async (id) => {
  await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
};

module.exports = { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom };