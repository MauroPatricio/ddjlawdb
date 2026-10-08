import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/apiRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares Globais
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
const rawOrigins = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir ficheiros estáticos enviados (Uploads de PDF)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Rotas da API
app.use('/api/v1', apiRoutes);

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota não encontrada: ${req.originalUrl}`,
  });
});

// Middleware Global de Erros
app.use(errorHandler);

export default app;
