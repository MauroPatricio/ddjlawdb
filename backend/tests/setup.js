import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Information } from '../src/models/Information.js';
import { Setting } from '../src/models/Setting.js';

jest.setTimeout(10000);

let usersStore = [];
let infoStore = [];
let settingStore = null;

export const connectTestDB = async () => {
  usersStore = [];
  infoStore = [];
  settingStore = null;
};

export const clearTestDB = async () => {
  usersStore = [];
  infoStore = [];
  settingStore = null;
};

export const closeTestDB = async () => {
  usersStore = [];
  infoStore = [];
  settingStore = null;
};

// Mock de Setting.findOne
jest.spyOn(Setting, 'findOne').mockImplementation(async () => {
  if (!settingStore) {
    settingStore = {
      _id: 'default_setting_id',
      notificationEmail: '',
      sendHour: '09:00',
      period: 'Diário',
      daysBeforeExpiration: 30,
      notificationsEnabled: true,
      lastNotificationSentAt: null,
      save: async function () {
        return this;
      },
    };
  }
  return settingStore;
});

// Mock de Setting.create
jest.spyOn(Setting, 'create').mockImplementation(async (doc) => {
  settingStore = {
    _id: 'default_setting_id',
    notificationEmail: doc.notificationEmail || '',
    sendHour: doc.sendHour || '09:00',
    period: doc.period || 'Diário',
    daysBeforeExpiration: doc.daysBeforeExpiration || 30,
    notificationsEnabled: doc.notificationsEnabled !== false,
    lastNotificationSentAt: null,
    save: async function () {
      return this;
    },
  };
  return settingStore;
});

// Mock de User.countDocuments
jest.spyOn(User, 'countDocuments').mockImplementation(async () => usersStore.length);

// Mock de User.create
jest.spyOn(User, 'create').mockImplementation(async (docs) => {
  const list = Array.isArray(docs) ? docs : [docs];
  const createdList = [];
  for (const doc of list) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(doc.password || 'password123', salt);
    const id = (Date.now() + Math.random()).toString();
    const user = {
      _id: id,
      name: doc.name,
      email: doc.email,
      password: hashedPassword,
      role: doc.role || 'leitor',
      active: doc.active !== false,
      matchPassword: async function (entered) {
        return await bcrypt.compare(entered, this.password);
      },
      save: async function () {
        return this;
      },
      deleteOne: async function () {
        usersStore = usersStore.filter((u) => String(u._id) !== String(id));
      },
    };
    usersStore.push(user);
    createdList.push(user);
  }
  return Array.isArray(docs) ? createdList : createdList[0];
});

// Mock de User.findOne
jest.spyOn(User, 'findOne').mockImplementation((query) => {
  const found = usersStore.find((u) => u.email === query.email);
  const promise = Promise.resolve(found || null);
  promise.select = () => Promise.resolve(found || null);
  return promise;
});

// Mock de User.find
jest.spyOn(User, 'find').mockImplementation((query = {}) => {
  let filtered = [...usersStore];
  if (query.$or) {
    const searchTerm = (query.$or[0]?.name?.$regex || '').toLowerCase();
    filtered = filtered.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(searchTerm) ||
        (u.email || '').toLowerCase().includes(searchTerm) ||
        (u.role || '').toLowerCase().includes(searchTerm)
    );
  }

  const chain = {
    select: () => chain,
    sort: () => chain,
    then: (resolve) => resolve(filtered),
  };
  return chain;
});

// Mock de User.findById
jest.spyOn(User, 'findById').mockImplementation((id) => {
  const found = usersStore.find((u) => String(u._id) === String(id));
  if (!found) {
    const nullQuery = {
      select: () => Promise.resolve(found),
      then: (resolve) => resolve(found),
    };
    return nullQuery;
  }

  const query = {
    select: () => Promise.resolve(found),
    then: (resolve) => resolve(found),
  };
  return query;
});

// Mock de Information.countDocuments
jest.spyOn(Information, 'countDocuments').mockImplementation(async (query = {}) => {
  if (query.$or) {
    const searchTerm = (query.$or[0]?.infoRef?.$regex || '').toLowerCase();
    return infoStore.filter(
      (i) =>
        (i.infoRef || '').toLowerCase().includes(searchTerm) ||
        (i.brand || '').toLowerCase().includes(searchTerm) ||
        (i.owner || '').toLowerCase().includes(searchTerm)
    ).length;
  }
  return infoStore.length;
});

// Mock de Information.create
jest.spyOn(Information, 'create').mockImplementation(async (docs) => {
  const list = Array.isArray(docs) ? docs : [docs];
  const createdList = [];
  for (const doc of list) {
    const expDate = doc.expirationDate
      ? new Date(doc.expirationDate)
      : (function () {
          const d = doc.date ? new Date(doc.date) : new Date();
          d.setFullYear(d.getFullYear() + 10);
          return d;
        })();

    const newInfo = {
      _id: (Date.now() + Math.random()).toString(),
      infoRef: doc.infoRef || '',
      fileType: doc.fileType || 'Marca Comercial',
      date: doc.date ? new Date(doc.date) : new Date(),
      expirationDate: expDate,
      brand: doc.brand || '',
      clazz: Number(doc.clazz || 0),
      owner: doc.owner || '',
      status: doc.status || 'Concedido',
      certified: doc.certified || 'Não',
      address: doc.address || '',
      observation: doc.observation || '',
      documentUrl: doc.documentUrl || '',
      documentOriginalName: doc.documentOriginalName || '',
      logoUrl: doc.logoUrl || '',
      createdBy: doc.createdBy,
      createdAt: new Date(),
      deleteOne: async function () {
        infoStore = infoStore.filter((i) => String(i._id) !== String(this._id));
      },
    };
    infoStore.push(newInfo);
    createdList.push(newInfo);
  }
  return Array.isArray(docs) ? createdList : createdList[0];
});

// Mock de Information.find
jest.spyOn(Information, 'find').mockImplementation((query = {}) => {
  let filtered = [...infoStore];
  if (query.$or) {
    const searchTerm = (query.$or[0]?.infoRef?.$regex || '').toLowerCase();
    filtered = filtered.filter(
      (i) =>
        (i.infoRef || '').toLowerCase().includes(searchTerm) ||
        (i.brand || '').toLowerCase().includes(searchTerm) ||
        (i.owner || '').toLowerCase().includes(searchTerm)
    );
  }
  if (query.expirationDate && query.expirationDate.$lte) {
    const maxDate = new Date(query.expirationDate.$lte);
    filtered = filtered.filter((i) => i.expirationDate && new Date(i.expirationDate) <= maxDate);
  }

  const chain = {
    sort: () => chain,
    skip: () => chain,
    limit: (l) => (l ? filtered.slice(0, l) : filtered),
    then: (resolve) => resolve(filtered),
  };
  return chain;
});

// Mock de Information.findById
jest.spyOn(Information, 'findById').mockImplementation((id) => {
  const found = infoStore.find((i) => String(i._id) === String(id));
  if (!found) return Promise.resolve(null);
  return Promise.resolve({
    ...found,
    deleteOne: async function () {
      infoStore = infoStore.filter((i) => String(i._id) !== String(id));
    },
  });
});

// Mock de Information.findByIdAndUpdate
jest.spyOn(Information, 'findByIdAndUpdate').mockImplementation(async (id, updateFields) => {
  const index = infoStore.findIndex((i) => String(i._id) === String(id));
  if (index === -1) return null;
  infoStore[index] = { ...infoStore[index], ...updateFields };
  return infoStore[index];
});

// Mock de Information.findByIdAndDelete
jest.spyOn(Information, 'findByIdAndDelete').mockImplementation(async (id) => {
  const index = infoStore.findIndex((i) => String(i._id) === String(id));
  if (index === -1) return null;
  const deleted = infoStore[index];
  infoStore.splice(index, 1);
  return deleted;
});
