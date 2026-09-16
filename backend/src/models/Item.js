import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pendente', 'em_progresso', 'concluido'],
      default: 'pendente',
    },
    category: {
      type: String,
      default: 'geral',
    },
  },
  {
    timestamps: true,
  }
);

export const Item = mongoose.model('Item', itemSchema);
