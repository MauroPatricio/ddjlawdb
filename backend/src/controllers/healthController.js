import mongoose from 'mongoose';

export const getHealthCheck = async (req, res) => {
  const dbStateMap = {
    0: 'Desconectado',
    1: 'Conectado',
    2: 'Conectando',
    3: 'Desconectando',
  };

  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbStateCode] || 'Desconhecido';

  res.status(200).json({
    success: true,
    message: 'Servidor Express a funcionar correctamente!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStateCode === 1,
      status: dbStatus,
    },
  });
};
