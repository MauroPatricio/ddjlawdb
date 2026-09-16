import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ddjlawdb_secret_key_2026_x9812');
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Utilizador não encontrado' });
      }
      return next();
    } catch (error) {
      console.error('Erro de autenticação JWT:', error.message);
      return res.status(401).json({ success: false, message: 'Não autorizado, token inválido ou expirado' });
    }
  }

  return res.status(401).json({ success: false, message: 'Não autorizado, nenhum token fornecido' });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Nível de acesso '${req.user?.role || 'sem função'}' não tem permissão para esta ação`,
      });
    }
    next();
  };
};
