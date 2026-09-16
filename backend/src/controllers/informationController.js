import { Information } from '../models/Information.js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

// Seed automático com os dados idênticos aos das fotos enviadas
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
  } catch (err) {
    console.error('Erro ao popular informações:', err.message);
  }
};

// Obter lista com suporte a filtro, paginação e pesquisa
export const getInformations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { infoRef: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { owner: { $regex: search, $options: 'i' } },
        { fileType: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Information.countDocuments(query);
    const informations = await Information.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: informations.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: informations,
    });
  } catch (error) {
    next(error);
  }
};

// Obter detalhe de uma Informação (Ficha Técnica réplica Foto 3)
export const getInformationById = async (req, res, next) => {
  try {
    const information = await Information.findById(req.params.id);
    if (!information) {
      return res.status(404).json({ success: false, message: 'Informação não encontrada' });
    }
    res.status(200).json({ success: true, data: information });
  } catch (error) {
    next(error);
  }
};

// Criar nova informação + Upload de PDF e Logotipo
export const createInformation = async (req, res, next) => {
  try {
    const { infoRef, fileType, date, brand, clazz, owner, status, certified, address, observation } = req.body;

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
      // Compatibilidade com single file upload
      documentUrl = `/uploads/documents/${req.file.filename}`;
      documentOriginalName = req.file.originalname;
    }

    const information = await Information.create({
      infoRef,
      fileType,
      date: date ? new Date(date) : new Date(),
      brand,
      clazz: Number(clazz),
      owner,
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
    if (updateFields.date) updateFields.date = new Date(updateFields.date);

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

    information = await Information.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

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

    // Estilo dos Cabeçalhos
    worksheet.columns = [
      { header: 'Informação Ref.', key: 'infoRef', width: 18 },
      { header: 'Tipo de Ficheiro', key: 'fileType', width: 20 },
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Marca', key: 'brand', width: 30 },
      { header: 'Classe', key: 'clazz', width: 10 },
      { header: 'Proprietário', key: 'owner', width: 40 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Certificado', key: 'certified', width: 12 },
      { header: 'Endereço', key: 'address', width: 45 },
      { header: 'Observação', key: 'observation', width: 35 },
    ];

    // Estilizar linha de cabeçalho
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Adicionar Dados
    informations.forEach((info) => {
      worksheet.addRow({
        infoRef: info.infoRef,
        fileType: info.fileType,
        date: info.date ? new Date(info.date).toISOString().split('T')[0] : '',
        brand: info.brand,
        clazz: info.clazz,
        owner: info.owner,
        status: info.status,
        certified: info.certified,
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
