const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Apelido é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    documentId: {
      type: String,
      required: [true, 'Documento de identificação é obrigatório'],
      trim: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['reservado', 'checked-in', 'checked-out'],
      default: 'reservado',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Guest', guestSchema);