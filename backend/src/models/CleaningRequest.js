const mongoose = require('mongoose');

const cleaningRequestSchema = new mongoose.Schema(
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
    status: {
      type: String,
      enum: ['pendente', 'em_andamento', 'concluido'],
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
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CleaningRequest', cleaningRequestSchema);