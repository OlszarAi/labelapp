const express = require('express');
const router = express.Router();
const labelsController = require('../controllers/labelsController');

// Pobieranie wszystkich etykiet
router.get('/', labelsController.getAllLabels);

// Pobieranie pojedynczej etykiety
router.get('/:id', labelsController.getLabelById);

// Tworzenie nowej etykiety
router.post('/', labelsController.createLabel);

// Aktualizacja etykiety
router.put('/:id', labelsController.updateLabel);

// Usuwanie etykiety
router.delete('/:id', labelsController.deleteLabel);

module.exports = router;