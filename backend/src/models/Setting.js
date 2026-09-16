import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    notificationEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    sendHour: {
      type: String,
      default: '09:00',
      trim: true,
    },
    period: {
      type: String,
      enum: ['Diário', 'Semanal', 'Mensal'],
      default: 'Diário',
    },
    daysBeforeExpiration: {
      type: Number,
      default: 30,
      min: 1,
      max: 365,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    lastNotificationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
