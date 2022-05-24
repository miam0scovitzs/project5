const jwt = require("jsonwebtoken");

const authUser = async function(req,res,next){
    try{
        const token = req.header("Authorization","Bearer Token");
        if(!token)
         return res.status(403).send({status:false,message:"Authentication Token is Required"});
         let tokenSplit = token.split(" ");

         let decodedToken = jwt.decode(tokenSplit[1], "project5Group42");
         if(Date.now() > (decodedToken.exp) * 1000 )
         return res.status(403).send({status:false,message:"Token is Expired,please generate a new Token"});

         let tokenVerify = jwt.verify(tokenSplit[1], "project5Group42")
         if(!tokenVerify)
         return res.status(403).send({status:false,message:"Token is NOT Valid"})
         console.log(decodedToken.userId);

         req.userId = decodedToken.userId;
         next();
    }
    catch(err){
         res.status(500).send({status:false,message:err.message})
    }
}

module.exports.authUser = authUser