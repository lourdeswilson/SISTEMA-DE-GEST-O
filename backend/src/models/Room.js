const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'Número do quarto é obrigatório'],
      unique: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['single', 'double', 'suite'],
      required: true,
    },
    status: {
      type: String,
      enum: ['disponivel', 'ocupado', 'reservado', 'limpeza', 'manutencao'],
      default: 'disponivel',
    },
    floor: {
      type: Number,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
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

module.exports = mongoose.model('Room', roomSchema);