// Expense module routes
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const { createExpenseSchema } = require('./expense.validator');
const controller = require('./expense.controller');

router.get('/', auth, controller.listExpenses);
router.post('/', auth, validate(createExpenseSchema), controller.createExpense);

module.exports = router;
