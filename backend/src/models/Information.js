import mongoose from 'mongoose';

const informationSchema = new mongoose.Schema(
  {
    infoRef: {
      type: String,
      required: [true, 'A referência da informação é obrigatória'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'O tipo de ficheiro é obrigatório'],
      default: 'Marca Comercial',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    brand: {
      type: String,
      required: [true, 'A marca é obrigatória'],
      trim: true,
    },
    clazz: {
      type: Number,
      required: [true, 'A classe é obrigatória'],
    },
    owner: {
      type: String,
      required: [true, 'O proprietário é obrigatório'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Concedido', 'Publicado', 'Pendente', 'Recusado'],
      default: 'Concedido',
    },
    certified: {
      type: String,
      enum: ['Sim', 'Não'],
      default: 'Não',
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    observation: {
      type: String,
      default: '',
      trim: true,
    },
    documentUrl: {
      type: String,
      default: '',
    },
    documentOriginalName: {
      type: String,
      default: '',
    },
    logoUrl: {
      type: String,
      default: '',
    },
    expirationDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

informationSchema.pre('save', function (next) {
  if (!this.expirationDate) {
    const baseDate = this.date ? new Date(this.date) : new Date();
    const exp = new Date(baseDate);
    exp.setFullYear(exp.getFullYear() + 10);
    this.expirationDate = exp;
  }
  next();
});

export const Information = mongoose.model('Information', informationSchema);
