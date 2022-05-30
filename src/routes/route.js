const express = require('express');
const router = express.Router();

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");
const productController = require("../controllers/productController");
const cartController = require("../controllers/cartController");
const middleware = require('../middleware/auth')


///////////////// [ ALL API's HERE ] /////////////////
router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
router.get('/user/:userId/profile',middleware.authUser,userController.getUser)
router.put('/user/:userId/profile',middleware.authUser,userController.updateUser)

router.post('/products',productController.createProduct)
router.get('/products',productController.getProduct)
router.get('/products/:productId',productController.getProductById)
router.put('/products/:productId',productController.updateProduct)
router.delete('/products/:productId',productController.deleteProduct)

router.post('/users/:userId/cart',middleware.authUser,cartController.createCart)
router.get('/users/:userId/cart',middleware.authUser,cartController.getCart)
//router.put('/users/:userId/cart',middleware.authUser,cartController.updateCart)
router.delete('/users/:userId/cart',middleware.authUser,cartController.deleteCart)

///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;