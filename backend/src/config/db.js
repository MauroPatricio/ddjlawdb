import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️  MONGODB_URI não definida no ficheiro .env');
      return false;
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB: ${error.message}`);
    // Em produção podemos tratar de outra forma, aqui garantimos resiliência do servidor
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconectado com sucesso.');
});
