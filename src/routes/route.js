const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");
const middleware = require('../middleware/auth')


///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',middleware.authUser,userController.getUser)
router.put('/user/:userId/profile',middleware.authUser,userController.updateUser)


///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;