const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    problem: {
      type: String,
      required: [true, 'Descrição do problema é obrigatória'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pendente', 'em_reparo', 'resolvido'],
      default: 'pendente',
    },
    priority: {
      type: String,
      enum: ['normal', 'urgente'],
      default: 'normal',
    },
    notes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);