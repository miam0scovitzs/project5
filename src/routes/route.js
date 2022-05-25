const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");



///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
 router.get('/user/:userId/profile',userController.getUser)
// router.put('/user/:userId/profile',userController.getUser)


///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;