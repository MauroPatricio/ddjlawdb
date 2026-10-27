import { Information } from '../models/Information.js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

// Seed automático e migração de registos legados
export const seedInitialInformations = async () => {
  try {
    const count = await Information.countDocuments();
    if (count === 0) {
      console.log('🌱 A popular base de dados com informações do SIGINFO...');
      await Information.create([
        {
          infoRef: '9953/2006',
          fileType: 'Marca Comercial',
          date: new Date('2006-11-16'),
          brand: 'CHOLESTRO',
          clazz: 30,
          owner: 'FOODCORP (PROPRIETARY) LIMITED',
          status: 'Concedido',
          certified: 'Não',
          address: 'Parc Nicol, Building No. 1, 3001 William Nicol Drive, Bryanston, 2021, Gauteng Province',
          observation: 'Renovação 2016 Próxima DIU 2021',
        },
        {
          infoRef: '9952/2006',
          fileType: 'Marca Comercial',
          date: new Date('2006-11-16'),
          brand: 'CHOLESTRO',
          clazz: 29,
          owner: 'FOODCORP (PROPRIETARY) LIMITED',
          status: 'Concedido',
          certified: 'Não',
          address: 'Parc Nicol, Building No. 1, Bryanston',
          observation: 'Concedido sem alterações',
        },
        {
          infoRef: '9632/2005',
          fileType: 'Marca Comercial',
          date: new Date('2005-12-01'),
          brand: 'ORAQUICK',
          clazz: 10,
          owner: 'ORASURE TECHNOLOGIES, INC',
          status: 'Concedido',
          certified: 'Não',
          address: '220 East First Street, Bethlehem, PA 18015, USA',
          observation: 'Marca médica registrada',
        },
        {
          infoRef: '962420',
          fileType: 'Marca Comercial',
          date: new Date('2008-03-23'),
          brand: 'ONDUVILLA',
          clazz: 19,
          owner: 'ONDULINE',
          status: 'Concedido',
          certified: 'Não',
          address: '24 Quai Gallieni, 92150 Suresnes, France',
          observation: 'Materiais de construção',
        },
        {
          infoRef: '9620/2005',
          fileType: 'Marca Comercial',
          date: new Date('2005-12-01'),
          brand: 'ORASURE',
          clazz: 10,
          owner: 'ORASURE TECHNOLOGIES, INC',
          status: 'Concedido',
          certified: 'Não',
          address: '220 East First Street, Bethlehem, PA 18015, USA',
          observation: 'Dispositivos de diagnóstico',
        },
        {
          infoRef: '960302',
          fileType: 'Marca Comercial',
          date: new Date('2013-01-25'),
          brand: 'SENSODYNE',
          clazz: 3,
          owner: 'Stafford-Miller (Ireland) Miller',
          status: 'Publicado',
          certified: 'Não',
          address: 'Clocherane, Youghal Road, Dungarvan, Co. Waterford, Ireland',
          observation: 'Higiene bucal e pasta dentífrica',
        },
        {
          infoRef: '9447/2005',
          fileType: 'Marca Comercial',
          date: new Date('2005-10-20'),
          brand: 'PAM GOLDING PROPERTIES',
          clazz: 36,
          owner: 'PAM GOLDING INTERNATIONAL HOLDINGS (PROPRIETARY) LIMITED',
          status: 'Concedido',
          certified: 'Não',
          address: 'Cape Town, South Africa',
          observation: 'Serviços imobiliários',
        },
        {
          infoRef: '9413/2005',
          fileType: 'Marca Comercial',
          date: new Date('2005-10-12'),
          brand: 'PAM GOLDING PROPERTIES',
          clazz: 36,
          owner: 'PAM GOLDING INTERNATIONAL HOLDINGS (PROPRIETARY) LIMITED',
          status: 'Concedido',
          certified: 'Não',
          address: 'Cape Town, South Africa',
          observation: 'Serviços imobiliários e gestão',
        },
        {
          infoRef: '937925/2007',
          fileType: 'Marca Comercial',
          date: new Date('2007-09-11'),
          brand: 'L & M FRONT LABEL (W/ROUND LOGO & LM CREST)',
          clazz: 34,
          owner: 'PHILIP MORRIS PRODUCTS S.A.',
          status: 'Concedido',
          certified: 'Não',
          address: 'Quai Jeanrenaud 3, 2000 Neuchâtel, Switzerland',
          observation: 'Produtos de tabaco',
        },
        {
          infoRef: '914841',
          fileType: 'Marca Comercial',
          date: new Date('2007-01-05'),
          brand: 'PATTEX GAFFER TAPE',
          clazz: 16,
          owner: 'HENKEL AG & CO. KGaA',
          status: 'Concedido',
          certified: 'Não',
          address: 'Henkelstrasse 67, 40589 Düsseldorf, Germany',
          observation: 'Fitas adesivas industriais',
        },
      ]);
      console.log('✅ Dados de demonstração do SIGINFO criados com sucesso!');
    }

    // Migração permanente para garantir diuDate e renewalDate em TODOS os documentos no MongoDB
    const legacyRecords = await Information.find({
      $or: [
        { diuDate: { $exists: false } },
        { diuDate: null },
        { renewalDate: { $exists: false } },
        { renewalDate: null },
      ],
    });

    if (legacyRecords.length > 0) {
      console.log(`🔄 A migrar ${legacyRecords.length} registos sem Data DIU ou Renovação no MongoDB...`);
      for (const record of legacyRecords) {
        const baseDate = record.publicationDate || record.date || new Date();
        const pub = new Date(baseDate);

        const ren = record.renewalDate || record.expirationDate ? new Date(record.renewalDate || record.expirationDate) : new Date(pub);
        if (!record.renewalDate && !record.expirationDate) {
          ren.setFullYear(ren.getFullYear() + 10);
        }

        const diu = record.diuDate ? new Date(record.diuDate) : new Date(pub);
        if (!record.diuDate) {
          diu.setFullYear(diu.getFullYear() + 5);
        }

        await Information.findByIdAndUpdate(record._id, {
          publicationDate: pub,
          date: pub,
          renewalDate: ren,
          expirationDate: ren,
          diuDate: diu,
        });
      }
      console.log('✅ Migração de datas no MongoDB concluída com sucesso!');
    }
  } catch (err) {
    console.error('Erro ao popular ou migrar informações:', err.message);
  }
};

// Obter lista com suporte a filtro, paginação e pesquisa
export const getInformations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';
    const ownerFilter = req.query.owner || '';
    const brandFilter = req.query.brand || '';
    const countryFilter = req.query.country || '';

    const query = {};
    const conditions = [];

    if (search) {
      conditions.push({
        $or: [
          { infoRef: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { owner: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { fileType: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
          { modification: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ],
      });
    }

    if (ownerFilter) {
      conditions.push({ owner: { $regex: ownerFilter, $options: 'i' } });
    }
    if (brandFilter) {
      conditions.push({ brand: { $regex: brandFilter, $options: 'i' } });
    }
    if (countryFilter) {
      conditions.push({ country: { $regex: countryFilter, $options: 'i' } });
    }

    if (conditions.length === 1) {
      Object.assign(query, conditions[0]);
    } else if (conditions.length > 1) {
      query.$and = conditions;
    }

    const total = await Information.countDocuments(query);
    const informations = await Information.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Mapeamento dinâmico para garantir que diuDate e renewalDate nunca sejam nulos no objeto retornado
    const sanitizedInformations = informations.map((info) => {
      const doc = info.toObject ? info.toObject() : { ...info };
      const baseDate = doc.publicationDate || doc.date || new Date();

      if (!doc.publicationDate) {
        doc.publicationDate = baseDate;
      }
      if (!doc.renewalDate) {
        const ren = new Date(baseDate);
        ren.setFullYear(ren.getFullYear() + 10);
        doc.renewalDate = ren;
        doc.expirationDate = ren;
      }
      if (!doc.diuDate) {
        const diu = new Date(baseDate);
        diu.setFullYear(diu.getFullYear() + 5);
        doc.diuDate = diu;
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      count: sanitizedInformations.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: sanitizedInformations,
    });
  } catch (error) {
    next(error);
  }
};

// Obter detalhe de uma Informação (Ficha Técnica)
export const getInformationById = async (req, res, next) => {
  try {
    const information = await Information.findById(req.params.id);
    if (!information) {
      return res.status(404).json({ success: false, message: 'Informação não encontrada' });
    }

    let changed = false;
    const baseDate = information.publicationDate || information.date || new Date();

    if (!information.renewalDate) {
      const ren = new Date(baseDate);
      ren.setFullYear(ren.getFullYear() + 10);
      information.renewalDate = ren;
      information.expirationDate = ren;
      changed = true;
    }

    if (!information.diuDate) {
      const diu = new Date(baseDate);
      diu.setFullYear(diu.getFullYear() + 5);
      information.diuDate = diu;
      changed = true;
    }

    if (changed) {
      await information.save();
    }

    res.status(200).json({ success: true, data: information });
  } catch (error) {
    next(error);
  }
};

// Criar nova informação + Upload de PDF e Logotipo
export const createInformation = async (req, res, next) => {
  try {
    const {
      infoRef,
      fileType,
      publicationDate,
      date,
      renewalDate,
      expirationDate,
      diuDate,
      applicationDate,
      concessionDate,
      brand,
      clazz,
      owner,
      country,
      modification,
      status,
      certified,
      address,
      observation,
    } = req.body;

    let documentUrl = '';
    let documentOriginalName = '';
    let logoUrl = '';

    if (req.files) {
      if (req.files.document && req.files.document[0]) {
        const docFile = req.files.document[0];
        documentUrl = `/uploads/documents/${docFile.filename}`;
        documentOriginalName = docFile.originalname;
      }
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        logoUrl = `/uploads/logos/${logoFile.filename}`;
      }
    } else if (req.file) {
      documentUrl = `/uploads/documents/${req.file.filename}`;
      documentOriginalName = req.file.originalname;
    }

    const pubDate = publicationDate || date ? new Date(publicationDate || date) : new Date();

    let renDate = renewalDate || expirationDate ? new Date(renewalDate || expirationDate) : undefined;
    if (!renDate || isNaN(renDate.getTime())) {
      renDate = new Date(pubDate);
      renDate.setFullYear(renDate.getFullYear() + 10);
    }

    let diuDateObj = diuDate ? new Date(diuDate) : undefined;
    if (!diuDateObj || isNaN(diuDateObj.getTime())) {
      diuDateObj = new Date(pubDate);
      diuDateObj.setFullYear(diuDateObj.getFullYear() + 5);
    }

    const appDate = applicationDate ? new Date(applicationDate) : undefined;
    const concDate = concessionDate ? new Date(concessionDate) : undefined;

    const information = await Information.create({
      infoRef,
      fileType,
      publicationDate: pubDate,
      date: pubDate,
      renewalDate: renDate,
      expirationDate: renDate,
      diuDate: diuDateObj,
      applicationDate: appDate,
      concessionDate: concDate,
      brand,
      clazz: Number(clazz),
      owner,
      country: country || '',
      modification: modification || '',
      status: status || 'Concedido',
      certified: certified || 'Não',
      address: address || '',
      observation: observation || '',
      documentUrl,
      documentOriginalName,
      logoUrl,
      createdBy: req.user?._id,
    });

    res.status(201).json({ success: true, data: information });
  } catch (error) {
    next(error);
  }
};

// Atualizar informação existente
export const updateInformation = async (req, res, next) => {
  try {
    let information = await Information.findById(req.params.id);
    if (!information) {
      return res.status(404).json({ success: false, message: 'Informação não encontrada' });
    }

    const updateFields = { ...req.body };
    if (updateFields.clazz) updateFields.clazz = Number(updateFields.clazz);

    if (updateFields.publicationDate && updateFields.publicationDate !== '') {
      updateFields.publicationDate = new Date(updateFields.publicationDate);
      updateFields.date = updateFields.publicationDate;
    } else if (updateFields.date && updateFields.date !== '') {
      updateFields.publicationDate = new Date(updateFields.date);
      updateFields.date = updateFields.publicationDate;
    }

    if (updateFields.renewalDate && updateFields.renewalDate !== '') {
      updateFields.renewalDate = new Date(updateFields.renewalDate);
      updateFields.expirationDate = updateFields.renewalDate;
    } else if (updateFields.expirationDate && updateFields.expirationDate !== '') {
      updateFields.renewalDate = new Date(updateFields.expirationDate);
      updateFields.expirationDate = updateFields.renewalDate;
    }

    if (updateFields.diuDate !== undefined && updateFields.diuDate !== '') {
      const parsedDiu = new Date(updateFields.diuDate);
      if (!isNaN(parsedDiu.getTime())) {
        updateFields.diuDate = parsedDiu;
      }
    }

    if (updateFields.applicationDate !== undefined && updateFields.applicationDate !== '') {
      updateFields.applicationDate = new Date(updateFields.applicationDate);
    } else if (updateFields.applicationDate === '') {
      updateFields.applicationDate = null;
    }

    if (updateFields.concessionDate !== undefined && updateFields.concessionDate !== '') {
      updateFields.concessionDate = new Date(updateFields.concessionDate);
    } else if (updateFields.concessionDate === '') {
      updateFields.concessionDate = null;
    }

    if (req.files) {
      if (req.files.document && req.files.document[0]) {
        const docFile = req.files.document[0];
        if (information.documentUrl) {
          const oldPath = path.join(process.cwd(), information.documentUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateFields.documentUrl = `/uploads/documents/${docFile.filename}`;
        updateFields.documentOriginalName = docFile.originalname;
      }

      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        if (information.logoUrl) {
          const oldLogoPath = path.join(process.cwd(), information.logoUrl);
          if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
        }
        updateFields.logoUrl = `/uploads/logos/${logoFile.filename}`;
      }
    } else if (req.file) {
      if (information.documentUrl) {
        const oldPath = path.join(process.cwd(), information.documentUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateFields.documentUrl = `/uploads/documents/${req.file.filename}`;
      updateFields.documentOriginalName = req.file.originalname;
    }

    // Usar $set explicitamente para garantir que TODOS os campos (incluindo diuDate) são gravados no MongoDB
    information = await Information.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: information });
  } catch (error) {
    next(error);
  }
};

// Eliminar informação
export const deleteInformation = async (req, res, next) => {
  try {
    const information = await Information.findById(req.params.id);
    if (!information) {
      return res.status(404).json({ success: false, message: 'Informação não encontrada' });
    }

    if (information.documentUrl) {
      const filePath = path.join(process.cwd(), information.documentUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    if (information.logoUrl) {
      const logoPath = path.join(process.cwd(), information.logoUrl);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }

    await information.deleteOne();
    res.status(200).json({ success: true, message: 'Informação eliminada com sucesso' });
  } catch (error) {
    next(error);
  }
};

// Gerar e Descarregar Ficheiro Excel (.xlsx)
export const exportExcel = async (req, res, next) => {
  try {
    const informations = await Information.find().sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DDJ Law - SIGINFO System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Nossas Informações');

    // Definir colunas da folha Excel
    worksheet.columns = [
      { key: 'infoRef', width: 22 },
      { key: 'brand', width: 30 },
      { key: 'clazz', width: 10 },
      { key: 'status', width: 16 },
      { key: 'applicationDate', width: 18 },
      { key: 'publicationDate', width: 18 },
      { key: 'concessionDate', width: 18 },
      { key: 'renewalDate', width: 18 },
      { key: 'diuDate', width: 16 },
      { key: 'owner', width: 40 },
      { key: 'country', width: 20 },
      { key: 'certified', width: 14 },
      { key: 'modification', width: 35 },
      { key: 'address', width: 45 },
      { key: 'observation', width: 35 },
    ];

    // Linha 1: Inglês
    const headerRowEN = worksheet.addRow([
      'Application Number',
      'Trademark',
      'Class',
      'Status',
      'Application Date',
      'Publication date',
      'Concession Date',
      'Renewal date',
      'DIU',
      'Owner',
      'Country',
      'Certificate',
      'Modification /',
      'Address',
      'Observation',
    ]);

    // Linha 2: Português
    const headerRowPT = worksheet.addRow([
      'Numero de Registo',
      'Marca',
      'Classe',
      'Estado',
      'Data de aplicação',
      'Data de publicacao',
      'Data de Concessão',
      'DAta da renovacao',
      'DIU',
      'Proprietário',
      'Nacionalidade',
      'Certificado',
      'Alteração',
      'Endereço',
      'Observação',
    ]);

    // Estilizar as duas linhas de cabeçalho
    [headerRowEN, headerRowPT].forEach((row, idx) => {
      row.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: idx === 0 ? 11 : 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx === 0 ? '1E293B' : '334155' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    });

    // Adicionar Dados
    informations.forEach((info) => {
      const appDateStr = info.applicationDate
        ? new Date(info.applicationDate).toISOString().split('T')[0]
        : '';

      const pubDateStr = info.publicationDate
        ? new Date(info.publicationDate).toISOString().split('T')[0]
        : info.date
        ? new Date(info.date).toISOString().split('T')[0]
        : '';

      const concDateStr = info.concessionDate
        ? new Date(info.concessionDate).toISOString().split('T')[0]
        : '';

      const renDateStr = info.renewalDate
        ? new Date(info.renewalDate).toISOString().split('T')[0]
        : info.expirationDate
        ? new Date(info.expirationDate).toISOString().split('T')[0]
        : '';

      const diuDateStr = info.diuDate ? new Date(info.diuDate).toISOString().split('T')[0] : '';

      worksheet.addRow({
        infoRef: info.infoRef,
        brand: info.brand,
        clazz: info.clazz,
        status: info.status,
        applicationDate: appDateStr,
        publicationDate: pubDateStr,
        concessionDate: concDateStr,
        renewalDate: renDateStr,
        diuDate: diuDateStr,
        owner: info.owner,
        country: info.country || '',
        certified: info.certified,
        modification: info.modification || '',
        address: info.address || '',
        observation: info.observation || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio_informacoes_siginfo_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};
