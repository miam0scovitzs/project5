const productModel = require("../models/productModel");
const { uploadFile } = require("../aws/aws");
const validator = require("../validations/validator");


const createProduct=async function(req,res){


  
  let data=req.body;
  let files = req.files;
  let myList=["S", "XS","M","X", "L","XXL", "XL"] 
  
  if(!data){
  
      return res.status(400).send({status:false,msg:"no data is sent"})
  }
  
  let{title,description,price,currencyId,currencyFormat,isFreeShipping,style,installments,isDeleted}=data;
  
  let availableSizes=data.availableSizes
  
  if(!availableSizes){
      return res.status(400).send({status:false,msg:"availableSizes not selected"})
  }
  
  //installments=installments.trim();
  installments=parseInt(installments)

  if(!validator.isValidValue(title)){
  
      return res.status(400).send({status:false,msg:"title is invalid"})
  }


  
  let titleExists=await productModel.findOne({title:title,isDeleted:false})
  
  if(titleExists){
      return res.status(400).send({status:false,msg:"title already exists "})
  }
  
  
  if(!validator.isValidValue(description)){
  
      return res.status(400).send({status:false,msg:"description is not valid"})
  }
  
  
  if(!price) return res.status(400).send({status:false,msg:"price is required"})
  price=price.trim();
  price=parseFloat(price);
  if(Number.isNaN(price)) return res.status(400).send({status:false,msg:"invalid entry"})
  
  if(price==='undefined' || price===null) return res.status(400).send({status:false,msg:"price is invalid"})
  
  if(typeof price!=='number') return res.status(400).send({status:false,msg:"price is invalid"})
  
  if(typeof price!=='number' || price.toString().trim().length==0) return res.status(400).send({status:false,msg:"price is invalid"})
  

  
  availableSizes=JSON.parse(availableSizes)
  
  if(availableSizes.length==0){
      return res.status(400).send({status:false,msg:"availabeSizes value is not selected"})
  }
  
  if(availableSizes==='undefined' || availableSizes===null) return res.status(400).send({status:false,msg:"availableSizes is not valid"})
  
  let a=0
  for(let i=0;i<myList.length;i++)         //["S", "XS","M","X", "L","XXL", "XL"] 
  {
      for(let j=0;j<availableSizes.length;j++)
      {
          if(myList[i]==availableSizes[j])
          {
              a++;
              break;
          }
      }
  }

  if(a!=availableSizes.length) return res.status(400).send({status:false,msg:"invalid availableSizes seletion"})


  if(typeof currencyId!=='string') return res.status(400).send({status:false,msg:"invalid currencyId"})
  
  if(currencyId==='undefined' || currencyId==null) return res.status(400).send({status:false,msg:"currencyId is invalid"})
  
  if(typeof currencyId==='string' && currencyId.trim().length==0) return res.status(400).send({status:false,msg:"currencyId is not selected"})
  
  if(typeof currencyId==='string' && currencyId.trim()!=='INR') return res.status(400).send({status:false,msg:"wrong currencyId selected"})
  
  

  if(currencyFormat=='undefined || currencyFormat==null') return res.status(400).send({status:false,msg:"invalid currency format"})
  
  if(typeof currencyFormat!=='string') return res.status(400).send({status:false,msg:"invalid currencyFormat"})
  
  if(typeof currencyFormat==='string' && currencyFormat.trim().length!=0 && currencyFormat.trim()!=='₹')return res.status(400).send({status:false,msg:"invalid currencyFormat"})
  
  if(typeof currencyFormat==='string' && currencyFormat.trim().length==0) return res.status(400).send({status:false,msg:"invalid currencyFormat"})
  
  
  
   
  if(isFreeShipping){
  if(isFreeShipping.length==0) 
  isFreeShipping=false
  else{
  isFreeShipping=isFreeShipping.trim().toLowerCase();
  isFreeShipping=JSON.parse(isFreeShipping)
  }}
  isFreeShipping=false
   if(typeof isFreeShipping!=="boolean") return res.status(400).send({status:false,msg:"not a boolean value"})
  
  
  
  
  if(installments){
  if(!Number.isInteger(installments)) return res.status(400).send({status:false,msg:"installments is invalid select only integer value"})
  }
  
  
  if(isDeleted){
  
      if(typeof isDeleted!=='Boolean') return res.status(400).send({status:false,msg:"isDeleted is invalid"})
  }
  
  else
  isDeleted=false;
  
  
  if(style){
  
     style=style.trim();
    if(typeof style!=='string') return res.status(400).send({status:false,msg:"style is not valid"})
    if(style==='string' && style.trim().length==0) return res.status(400).send({status:false,msg:"style is not valid"})
  
  }
  
  
  
  if (!(files && files.length > 0)) {
      return res
          .status(400)
          .send({ status: false, message: "profile image is required" });
  }
  
  let productImage = await uploadFile(files[0]);
  
  if(productImage==="undefined" || productImage==null) return res.status(400).send({status:false,msg:"prodcutImage is not valid"})
  
  //if(productImage!=="string") return res.status(400).send({status:false,msg:"inalid productImage"})
  
  if(productImage==="string" && productImage.trim().length==0) return res.status(400).send({status:false,msg:"productImage is invalid"})
  
  
  
  
  let obj=new Object(data)
  obj.productImage=productImage;
  obj.availableSizes=availableSizes;
  obj.isFreeShipping=isFreeShipping;
  let newRecord=await productModel.create(obj)
  
  
  
  
  if(!newRecord){
    
      return res.status(500).send({status:false,msg:"record not inserted"})
  }
  
  else
  return res.status(201).send({status:true,msg:"success",data:newRecord})
  
  

  
  }

  

// const createProduct = async (req, res) => {
//   try{
//       let { title,description,price,currencyId,currencyFormat,
//           availableSizes,isFreeShipping,installments,style } = req.body

//           if (!validator.isValidDetails(req.body)) {
//               return res.status(400).send({ status: false, message: "please provide product details" })
//           }
      
//           if (!validator.isValidValue(title)) {
//               return res.status(400).send({ status: false, messege: "please provide title" })
//           }
//           let isDuplicateTitle = await productModel.findOne({ title })
//           if (isDuplicateTitle) {
//               return res.status(409).send({ status: false, message: "title already exists" })
//           }
  
//           if (!validator.isValidValue(description)) {
//               return res.status(400).send({ status: false, messege: "please provide description" })
//           }
//           if(style){
//           if (!validator.isValidValue(style)) {
//             return res.status(400).send({ status: false, messege: "please provide style" })
//         }}
  
//           if (!validator.isValidValue(price)) {
//               return res.status(400).send({ status: false, messege: "please provide price" })
//           }

//           if (isNaN(Number(price)))
//               return res.status(400).send({ status: false, message: "Price should be number" });

//           if (Number(price) < 0)
//               return res.status(400).send({ status: false, message: "Price should be positive number" });
  
//           if (!validator.isValidValue(currencyId)) {
//               return res.status(400).send({ status: false, messege: "please provide currencyId" })
//           }
  
//           if (currencyId != "INR") {
//               return res.status(400).send({ status: false, message: "currencyId should be INR" })
//           }

            
//           if (!validator.isValidValue(currencyFormat)) {
//             return res.status(400).send({ status: false, messege: "please provide currencyFormat" })
//         }

//         if (currencyFormat != "₹") {
//             return res.status(400).send({ status: false, message: "currencyFormat should be ₹" })
//         }
//         if(isFreeShipping||isFreeShipping==""){
//           if (!validator.isValidValue(isFreeShipping)) {
//             return res.status(400).send({ status: false, messege: "please provide valid isFreeShipping" })
//         }
//         if (["true", "false"].indexOf(isFreeShipping) == -1)
//         return res.status(400).send({ status: false, message: "IsFreeShipping value should be true or false",})  
           
//         }

//         if(installments){
//               if (installments <= 0 || installments % 1 != 0) {
//                   return res.status(400).send({ status: false, message: "installments should be zero or positive integers " })
//               }
//           }

//         if (!validator.isValidValue(availableSizes)) {
//               return res.status(400).send({ status: false, messege: "please provide availableSizes" })
//           }
//        availableSizes= JSON.parse(availableSizes)
//        for (let i = 0; i < availableSizes.length; i++) {
//        if (
//          ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes[i]) == -1
//        )
//         return res
//            .status(400)
//            .send({ status: false, msg: "invalid availableSizes selection" });
//       }
      
//       let files = req.files
//       if (!(files && files.length > 0)) {
//           return res.status(400).send({ status: false, message: "Please provide product image" })
//       }
//       let productImage = await uploadFile(files[0])

//       let productData = { title,description,price,currencyId,currencyFormat,
//           availableSizes,isFreeShipping,productImage,installments,style }

//       let savedData = await productModel.create(productData)
//       return res.status(201).send({ status: true, message: "new product created successfully", data: savedData });
//   }
//   catch(error){
//       return res.status(500).send({ status: false, message: error.message });
//   }
// }



/////API#2 :GET/products /////////////////////////////////

const getProduct = async function(req,res){
  try{
       const queryData = req.query;

       if (!validator.isValidDetails(queryData)) {
        queryData.isDeleted = false
        const allProduct = await productModel.find(queryData)
        return res.status(400).send({ status: true, message: "Success",count:allProduct.length ,data:allProduct})
        }

       let {name,priceGreaterThan,priceLessThan,priceSort,size} = queryData;
       const productObj = {isDeleted:false};

       if(size||size==''){
        if (!validator.isValidValue(size))
        return res.status(400).send({ status: false, message: "Please provide valid size" });
        productObj.availableSizes=size

       }

       if(name||name=='')
       {
        if (!validator.isValidValue(name))
        return res.status(400).send({ status: false, message: "Please provide name" });

        productObj.title={$regex:name}
       }

       if(priceGreaterThan)
       {
        if (isNaN(Number(priceGreaterThan)))
        return res.status(400).send({ status: false, message: "Price should be number" });

        if (Number(priceGreaterThan) < 0)
        return res.status(400).send({ status: false, message: "Price should be positive" });

        productObj.price={$gt : priceGreaterThan}
       }

       if(priceLessThan)
       {
        if (isNaN(Number(priceLessThan)))
        return res.status(400).send({ status: false, message: "Price should be number" });

        if (Number(priceLessThan) < 0)
        return res.status(400).send({ status: false, message: "Price should be positive" });

        productObj.price={$lt : priceLessThan}
       }

       if(priceGreaterThan && priceLessThan )
       {
         productObj.price={"$gt": priceGreaterThan,"$lt" : priceLessThan}
       }

       if(priceSort ||priceSort==""){
          if (!validator.isValidValue(priceSort)) {
          return res.status(400).send({ status: false, message: 'priceSort should be 1 or -1 '})
          }

          if (!((priceSort == 1) || (priceSort == -1))) {
          return res.status(400).send({ status: false, message: 'priceSort should be 1 or -1 '})
          }
      }


       const productDocs = await productModel.find(productObj).sort({price:priceSort})
        if( productDocs.length!=0)
          return res.status(200).send({status:true,message:"Succes",data:productDocs})
        else
          return res.status(404).send({status:false,message:"Product does not exists"})
      
  }
  catch(err){
       res.status(500).send({status:false,message:err.message})
  }
}

/////API#3 - GET /products/:productId  //////////////////////////////////////////////////////

const getProductById = async function(req,res){
try{
     const productId = req.params.productId;
     if (!validator.isValidObjectId(productId))
       return res.status(400).send({ status: false, message: `${productId} is NOT a valid productID` });

     const productDoc = await productModel.findOne({_id:productId,isDeleted:false});

     if(!productDoc)
       return res.status(404).send({status:false,message:"Product Does NOT exists"});

     return res.status(200).send({status:true,message:"Success",data:productDoc})
}
catch(err){
    return res.status(500).send({status:false,message:err.message})
}
}


//**************Update API*****************//
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!validator.isValidObjectId(productId))
      return res.status(400).send({ status: false, message: `${productId} is not valid objectId` });

    const findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!findProduct) return res.status(404).send({ status: false, message: "Product not found"});

    let body = req.body;
    let {
      title,
      description,
      price,
      style,
      availableSizes,
      installments,
      isFreeShipping,
    } = body;

    const newObj ={}

    const files = req.files;
    if (files && files.length > 0) {
      let productImage = await uploadFile(files[0]);
      newObj.productImage = productImage;
    }

    if (!(body && files))
      return res.status(400).send({ status: false, message: "Invalid Request" });

    if (title || title == "") {
      if (!validator.isValidValue(title))
        return res.status(400).send({ status: false, message:"Please provide the title" });

      const findTitle = await productModel.findOne({ title: title });
      if (findTitle) return res.status(409).send({ status: false, message: "This title already exists" });

      newObj.title = title;

    }
    if (description || description == "") {
      if (!validator.isValidValue(description))
        return res.status(400).send({ status: false, message:{ status: false, message: "Please provide the description" }  });

    newObj.description = description;      
    }
    if (price || price == "") {
      if (!validator.isValidValue(price))
        return res.status(400).send({ status: false, message: "Please provide the price" });

      if (isNaN(Number(price)))
        return res.status(400).send({ status: false, message: "Price should be number" });

      if (Number(price) < 0)
        return res.status(400).send({ status: false, message: "Price should be positive" });
    newObj.price = price;      

    }

    if (style || style == "") {
      if (!validator.isValidValue(style))
        return res.status(400).send({ status: false, message: "Please provide style" });
      newObj.style = style;      

    }
    if (installments || installments == "") {
      if (!validator.isValidValue(installments))
        return res.status(400).send({ status: false, message: "Please provide installments" });

      if (isNaN(Number(installments))||!(Number.isInteger(Number(installments))))
        return res.status(400).send({ status: false, message: "Installments should be an integer" });

      if (Number(installments) < 0 )
        return res.status(400).send({ status: false, message: "Installments should be positive" });
      newObj.installments = installments;      
    }

    if (isFreeShipping || isFreeShipping == "") {
      if (!validator.isValidValue(isFreeShipping))
        return res.status(400).send({ status: false, message: "Please provide isFreeShipping" });

      if (["true", "false"].indexOf(isFreeShipping) == -1)
        return res.status(400).send({ status: false, message: "IsFreeShipping value should be true or false",});
      newObj.isFreeShipping = isFreeShipping;      

    }

    if(availableSizes||availableSizes==''){
        if (!validator.isValidValue(availableSizes))
        return res.status(400).send({ status: false, message: "Please provide availableSizes" });

        availableSizes = JSON.parse(availableSizes);
        for (let i = 0; i < availableSizes.length; i++) {
          if (
            ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes[i]) == -1
          )
            return res.status(400).send({ status: false, message: "invalid availableSizes selection" });
    }
    newObj.availableSizes = availableSizes;      

    }

    let updatedProduct = await productModel.findByIdAndUpdate(
      productId ,
      { $set: newObj },
      { new: true }
    );
    return res.status(200).send({ status: true, message: "Success", data: updatedProduct });
  } 
  catch (error) {
    return res.status(500).send({ status: false,message: error.message });
  }
};


const deleteProduct = async (req, res) => {
    try{
        const productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "productId is invalid" });
        }

        const findProduct = await productModel.findOne({_id:productId,isDeleted:false});

        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'Product not found' })
        }

        await productModel.findByIdAndUpdate(
             productId ,
            { $set: { isDeleted: true, deletedAt: new Date() } }
            )

        return res.status(200).send({ status: true, message: 'Product deleted successfully.' })
    }
    catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports.createProduct = createProduct;
module.exports.getProduct = getProduct;
module.exports.getProductById = getProductById;
module.exports.updateProduct = updateProduct;
module.exports.deleteProduct=deleteProduct