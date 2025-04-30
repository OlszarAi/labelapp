const prisma = require('../models/db');

// Pobieranie wszystkich etykiet
exports.getAllLabels = async (req, res, next) => {
  try {
    const labels = await prisma.label.findMany();
    res.json(labels);
  } catch (error) {
    next(error);
  }
};

// Pobieranie pojedynczej etykiety po ID
exports.getLabelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const label = await prisma.label.findUnique({
      where: { id },
    });
    
    if (!label) {
      return res.status(404).json({ error: 'Etykieta nie znaleziona' });
    }
    
    res.json(label);
  } catch (error) {
    next(error);
  }
};

// Tworzenie nowej etykiety
exports.createLabel = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Nazwa i kolor są wymagane' });
    }
    
    const newLabel = await prisma.label.create({
      data: {
        name,
        color,
      },
    });
    
    res.status(201).json(newLabel);
  } catch (error) {
    next(error);
  }
};

// Aktualizacja etykiety
exports.updateLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    const updatedLabel = await prisma.label.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
      },
    });
    
    res.json(updatedLabel);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Etykieta nie znaleziona' });
    }
    next(error);
  }
};

// Usuwanie etykiety
exports.deleteLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.label.delete({
      where: { id },
    });
    
    res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Etykieta nie znaleziona' });
    }
    next(error);
  }
};