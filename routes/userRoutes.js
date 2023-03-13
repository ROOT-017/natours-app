const express = require('express');

const router = express.Router();

const userController = require('../controllers/userControllers');

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .patch(userController.updateUser)
  .delete(userController.deleteUser)
  .get(userController.getUser);

module.exports = router;
