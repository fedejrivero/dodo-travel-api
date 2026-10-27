const Service = require('../models/serviceModel');
const ServiceDocument = require('../models/serviceDocumentModel');

const DOCUMENT_TYPES = new Set(['reservation', 'invoice', 'receipt', 'liquidation']);

const isValidDocumentType = (type) => DOCUMENT_TYPES.has(type);

exports.getServiceDocuments = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    const documents = await ServiceDocument.findByServiceId(req.params.id);
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching service documents:', error);
    res.status(500).json({ success: false, error: 'Error fetching service documents' });
  }
};

exports.uploadServiceDocument = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, error: 'Invalid document type' });
    }
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    if (!req.file) return res.status(400).json({ success: false, error: 'A PDF or image file is required' });

    const documents = await ServiceDocument.save(id, type, req.file);
    const document = documents.find((item) => item.document_type === type);
    res.status(200).json({ success: true, data: document });
  } catch (error) {
    console.error('Error saving service document:', error);
    res.status(500).json({ success: false, error: 'Error saving service document' });
  }
};

exports.openServiceDocument = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, error: 'Invalid document type' });
    }
    const document = await ServiceDocument.findByType(id, type);
    if (!document) return res.status(404).json({ success: false, error: 'Document not found' });

    const safeName = document.original_name
      .replace(/[^\x20-\x7E]/g, '_')
      .replace(/[\r\n"\\]/g, '_');
    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Length', document.file_size);
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(document.original_name)}`
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(document.file_data);
  } catch (error) {
    console.error('Error opening service document:', error);
    res.status(500).json({ success: false, error: 'Error opening service document' });
  }
};

exports.deleteServiceDocument = async (req, res) => {
  try {
    const { id, type } = req.params;
    if (!isValidDocumentType(type)) {
      return res.status(400).json({ success: false, error: 'Invalid document type' });
    }
    const service = await Service.findById(id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
    await ServiceDocument.delete(id, type);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting service document:', error);
    res.status(500).json({ success: false, error: 'Error deleting service document' });
  }
};

