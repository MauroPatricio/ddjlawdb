import app from './app.js';
import { connectDB } from './config/db.js';
import { seedInitialUsers } from './controllers/authController.js';
import { seedInitialInformations } from './controllers/informationController.js';
import { startNotificationScheduler } from './services/notificationScheduler.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  const isDbConnected = await connectDB();
  if (isDbConnected) {
    await seedInitialUsers();
    await seedInitialInformations();
  } else {
    console.log('⚠️ MongoDB não conectado. A iniciar servidor em modo fallback/memória.');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor backend SIGINFO a rodar na porta ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
    startNotificationScheduler();
  });
};

startServer();
