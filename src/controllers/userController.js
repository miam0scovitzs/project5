const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const createUser = async function (req, res) {
  try {
      
  }
  catch(error){
      return res.status(500).send({status:false,message:error.message})
  }}


//API #2 :POST /login
// Allow an user to login with their email and password.
// On a successful login attempt return the userId and a JWT token contatining the userId, exp, iat.

const loginUser = async function(req,res){
  try{
       const loginData = req.body;

       const { email,password } = loginData;
       if(email && password)
       { 
         const userDetail = await userModel.findOne({email});
          if(!userDetail)
           return res.status(401).send({status:false,message:"EmailId is NOT Correct"});
       
       let encryptedPassword = userDetail.password;

       const passwordCheck = await bcrypt.compare(password,encryptedPassword);

       if(!passwordCheck)
         return res.status(401).send({status:false,message:"Password is NOT Correct"});

       const userId = userDetail._id;
       const token = await jwt.sign({
        userId : userId,
        iat: Math.floor(Date.now()/1000),
        exp: Math.floor(Date.now()/1000)+24*60*60 // expirydate =24 hours 
       },
       "project5Group42")

       return res.status(200).send({status:true,message:"User login successfull",data:{userId,token}})
       }
   }
     catch(err){
      return res.status(500).send({status:false,message:err.message})
     }
}














  module.exports.createUser=createUser
  module.exports.loginUser=loginUser
