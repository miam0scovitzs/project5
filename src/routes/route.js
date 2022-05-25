const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");



///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)
<<<<<<< HEAD
//router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',userController.getUser)
//router.put('/user/:userId/profile',userController.getUser)

=======
router.post('/login',userController.loginUser)
// router.get('/user/:userId/profile',userController.getUser)
// router.put('/user/:userId/profile',userController.getUser)
>>>>>>> 7295933c8244def8d1a04533113059227a4a3fe5


///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;