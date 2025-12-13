const express = require('express');
const TransactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, TransactionController.getAll);
router.post('/', authenticateToken, TransactionController.create);
router.put('/:id', authenticateToken, TransactionController.update);
router.delete('/:id', authenticateToken, TransactionController.delete);
router.get('/stats', authenticateToken, TransactionController.getStats);

module.exports = router;