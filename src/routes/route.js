const express = require('express');
const router = express.Router();
const aws = require("aws-sdk");

///////////////// [ IMPORTED CONTROLLERS ] /////////////////
const userController= require("../controllers/userController");



////////////////////////////aws////////////////////////////////
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)


///////////////// [ ALL API's HERE ] /////////////////
//router.post('/register',userController.createUser)
router.post('/login',userController.loginUser)
// router.get('/user/:userId/profile',userController.getUser)
// router.put('/user/:userId/profile',userController.getUser)


///////////////// [ EXPRORTED ROUTHER ] /////////////////
module.exports = router;