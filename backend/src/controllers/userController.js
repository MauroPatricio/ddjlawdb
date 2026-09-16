import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

// Listar todos os utilizadores (Apenas Admin)
export const getUsers = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Consultar utilizador por ID (Apenas Admin)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Criar novo utilizador (Apenas Admin)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, active } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Por favor preencha nome e email' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Já existe um utilizador registado com este email' });
    }

    const initialPassword = password && password.trim() !== '' ? password : 'password123';

    const newUser = await User.create({
      name,
      email,
      password: initialPassword,
      role: role || 'leitor',
      active: active !== undefined ? active : true,
      mustChangePassword: true,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: newUser.active,
        mustChangePassword: newUser.mustChangePassword,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar utilizador existente (Apenas Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, active } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        mustChangePassword: user.mustChangePassword,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Reset de palavra-passe por Admin (Redefine para 'password123' e força troca no próximo acesso)
export const resetUserPasswordByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    const defaultPassword = req.body.password || 'password123';
    user.password = defaultPassword;
    user.mustChangePassword = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Palavra-passe de '${user.name}' redefinida para '${defaultPassword}'. O utilizador deverá definir uma nova senha no próximo acesso.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Troca de palavra-passe obrigatória no primeiro acesso
export const changePasswordFirstAccess = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Por favor preencha todos os campos obrigatórios' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Palavra-passe atual incorreta' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'A nova palavra-passe deve conter pelo menos 6 caracteres' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'A nova palavra-passe e a confirmação não coincidem' });
    }

    if (newPassword === currentPassword) {
      return res.status(400).json({ success: false, message: 'A nova palavra-passe deve ser diferente da palavra-passe temporária' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Palavra-passe alterada com sucesso!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar utilizador (Apenas Admin)
export const deleteUser = async (req, res, next) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    if (req.user._id.toString() === userToDelete._id.toString()) {
      return res.status(400).json({ success: false, message: 'Não pode eliminar a sua própria conta ativa' });
    }

    await userToDelete.deleteOne();

    res.status(200).json({ success: true, message: 'Utilizador eliminado com sucesso' });
  } catch (error) {
    next(error);
  }
};

// Atualizar o próprio perfil (Qualquer utilizador autenticado)
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilizador não encontrado' });
    }

    if (name) user.name = name;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'A palavra-passe deve ter pelo menos 6 caracteres' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
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
