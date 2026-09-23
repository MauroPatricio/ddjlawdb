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
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    diuDate: {
      type: Date,
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
  const baseDate = this.publicationDate || this.date ? new Date(this.publicationDate || this.date) : new Date();

  if (!this.publicationDate) {
    this.publicationDate = baseDate;
  }
  if (!this.date) {
    this.date = baseDate;
  }

  // Data de Renovação (Validade Padrão: 10 Anos)
  if (!this.renewalDate) {
    if (this.expirationDate) {
      this.renewalDate = new Date(this.expirationDate);
    } else {
      const exp = new Date(baseDate);
      exp.setFullYear(exp.getFullYear() + 10);
      this.renewalDate = exp;
    }
  }
  if (!this.expirationDate && this.renewalDate) {
    this.expirationDate = new Date(this.renewalDate);
  }

  // Data para DIU - Declaração de Intenção de Uso (Padrão: 5 Anos)
  if (!this.diuDate) {
    const diu = new Date(baseDate);
    diu.setFullYear(diu.getFullYear() + 5);
    this.diuDate = diu;
  }

  next();
});

export const Information = mongoose.model('Information', informationSchema, 'information');
