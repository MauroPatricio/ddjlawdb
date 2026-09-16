import { Item } from '../models/Item.js';
import mongoose from 'mongoose';

// Fallback em memória caso a BD não esteja conectada durante os primeiros testes
let inMemoryItems = [
  { _id: '1', title: 'Configurar Servidor Express', description: 'Backend básico em Node.js com rotas e middlewares.', status: 'concluido', category: 'Backend', createdAt: new Date() },
  { _id: '2', title: 'Conexão MongoDB', description: 'Configuração do Mongoose com credenciais enviadas.', status: 'em_progresso', category: 'Database', createdAt: new Date() },
  { _id: '3', title: 'Interface React + Vite', description: 'Painel interativo conectado ao backend em tempo real.', status: 'pendente', category: 'Frontend', createdAt: new Date() },
];

export const getItems = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const items = await Item.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: items.length, data: items, source: 'database' });
    }
    return res.status(200).json({ success: true, count: inMemoryItems.length, data: inMemoryItems, source: 'memory' });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { title, description, category, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'O título do item é obrigatório' });
    }

    if (mongoose.connection.readyState === 1) {
      const newItem = await Item.create({ title, description, category, status });
      return res.status(201).json({ success: true, data: newItem, source: 'database' });
    }

    const newItem = {
      _id: Date.now().toString(),
      title,
      description: description || '',
      category: category || 'geral',
      status: status || 'pendente',
      createdAt: new Date(),
    };
    inMemoryItems.unshift(newItem);

    return res.status(201).json({ success: true, data: newItem, source: 'memory' });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deleted = await Item.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Item não encontrado' });
      }
      return res.status(200).json({ success: true, message: 'Item eliminado com sucesso', data: deleted });
    }

    inMemoryItems = inMemoryItems.filter(item => item._id !== id);
    return res.status(200).json({ success: true, message: 'Item eliminado da memória' });
  } catch (error) {
    next(error);
  }
};
