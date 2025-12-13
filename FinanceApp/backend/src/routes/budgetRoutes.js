const express = require('express');
const BudgetController = require('../controllers/budgetController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, BudgetController.getAll);
router.post('/', authenticateToken, BudgetController.create);
router.put('/:id', authenticateToken, BudgetController.update);
router.delete('/:id', authenticateToken, BudgetController.delete);

module.exports = router;