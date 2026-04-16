const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password é obrigatória'],
      minlength: [6, 'Password deve ter pelo menos 6 caracteres'],
    },
    role: {
      type: String,
      enum: ['admin', 'rh', 'recepcao', 'limpeza', 'manutencao'],
      required: [true, 'Perfil é obrigatório'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // cria automaticamente createdAt e updatedAt
  }
);

// Antes de guardar, encripta a password automaticamente
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para verificar password no login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);