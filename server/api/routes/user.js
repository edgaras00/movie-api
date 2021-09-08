const express = require("express");
const checkAuth = require('../middleware/check-auth');
const UserController = require('../controllers/users');
const router = express.Router();
require("dotenv").config();

// Sign up
router.post("/signup",UserController.users_signup);

router.post("/login",UserController.users_login);

router.delete("/:userId", checkAuth,UserController.users_delete_user);

module.exports = router;
