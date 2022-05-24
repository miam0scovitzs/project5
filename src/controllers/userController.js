const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const createUser = async function (req, res) {
  try {
      
  }
  catch(error){
      return res.status(500).send({status:false,message:error.message})
  }}
  module.exports.createUser=createUser