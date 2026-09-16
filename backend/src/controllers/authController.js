import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ddjlawdb_secret_key_2026_x9812', {
    expiresIn: '30d',
  });
};

// Seed de utilizadores padrão para primeiro acesso
export const seedInitialUsers = async () => {
  try {
    const defaultUsers = [
      {
        name: 'Mauro Patrício',
        email: 'mauro.patricio1@gmail.com',
        password: 'Teste1',
        role: 'admin',
        active: true,
      },
      {
        name: 'Lilia Tembe de Deus',
        email: 'admin@ddjlaw.co.mz',
        password: 'Admin123!',
        role: 'admin',
        active: true,
      },
      {
        name: 'Gestor SIGINFO',
        email: 'gestor@ddjlaw.co.mz',
        password: 'Gestor123!',
        role: 'gestor',
        active: true,
      },
      {
        name: 'Consulta Leitor',
        email: 'leitor@ddjlaw.co.mz',
        password: 'Leitor123!',
        role: 'leitor',
        active: true,
      },
    ];

    for (const u of defaultUsers) {
      const user = await User.findOne({ email: u.email }).select('+password');
      if (!user) {
        await User.create(u);
        console.log(`✅ Utilizador ${u.email} criado com sucesso!`);
      } else {
        const isMatch = await user.matchPassword(u.password);
        if (!isMatch || !user.active) {
          user.password = u.password;
          user.active = true;
          user.role = u.role;
          await user.save();
          console.log(`✅ Utilizador ${u.email} atualizado e sincronizado.`);
        }
      }
    }
  } catch (err) {
    console.error('Erro no seed de utilizadores:', err.message);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor forneça email e palavra-passe' });
    }

    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      await seedInitialUsers();
      user = await User.findOne({ email }).select('+password');
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Esta conta encontra-se inativa' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: Boolean(user.mustChangePassword),
      },
    });
  } catch (error) {
    next(error);
  }
};
