import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import {
  getInformations,
  getInformationById,
  createInformation,
  updateInformation,
  deleteInformation,
  exportExcel,
} from '../controllers/informationController.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMyProfile,
  resetUserPasswordByAdmin,
  changePasswordFirstAccess,
} from '../controllers/userController.js';
import { getSettings, updateSettings, sendTestEmail } from '../controllers/settingsController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { uploadInformationFiles } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Rotas de Autenticação
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Atualização do próprio perfil e troca de senha obrigatoria
router.put('/users/profile/me', protect, updateMyProfile);
router.put('/users/change-password-first-access', protect, changePasswordFirstAccess);

// Configurações do Sistema & Notificações por Email
router.route('/settings')
  .get(protect, getSettings)
  .put(protect, authorize('admin', 'gestor'), updateSettings);

router.post('/settings/test-email', protect, authorize('admin', 'gestor'), sendTestEmail);

// Gestão de Utilizadores (Apenas Administradores - Admin)
router.put('/users/:id/reset-password', protect, authorize('admin'), resetUserPasswordByAdmin);

router.route('/users')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

router.route('/users/:id')
  .get(protect, authorize('admin'), getUserById)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

// Exportar para Excel (todos os utilizadores autenticados)
router.get('/informations/export/excel', protect, exportExcel);

// Rotas de Informações (SIGINFO) com suporte a upload de Logotipo e PDF
router.route('/informations')
  .get(protect, getInformations)
  .post(protect, authorize('admin', 'gestor'), uploadInformationFiles, createInformation);

router.route('/informations/:id')
  .get(protect, getInformationById)
  .put(protect, authorize('admin', 'gestor'), uploadInformationFiles, updateInformation)
  .delete(protect, authorize('admin'), deleteInformation);

export default router;
