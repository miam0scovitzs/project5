const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const validator = require("../validations/validator");

const createCart = async (req, res) => {
    try{
        const userId = req.params.userId
        if (!validator.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: `${userId} is NOT a valid userID` });

        const findUser = await userModel.findById(userId) 
        if(!findUser) return res.status(404).send({ status: false, message: "No User With this Id" })
    
        if(req.userId!=userId)
            return res.status(403).send({ status: false, message: "Unauthorised Access" })

            
        if (!validator.isValidDetails(req.body)) {
            return res.status(400).send({ status: false, message: "please provide product details" })
        }
        let {productId,quantity,cartId}   = req.body

        if(!productId)
            return res.status(400).send({ status: false, message: " Please Provide a valid productID" });
        if(!quantity)
            return res.status(400).send({ status: false, message: " Please Provide a valid quantity of product" });    

        if (!validator.isValidObjectId(productId))
            return res.status(400).send({ status: false, message: `${productId} is NOT a valid productID` });
        
        const productDoc = await productModel.findOne({_id:productId,isDeleted:false});

        if(!productDoc)
            return res.status(404).send({status:false,message:"Product Does NOT exists"});
        
        if (isNaN(quantity))
            return res.status(400).send({ status: false, message: "Quantity should be number" });

        if (quantity < 1)
            return res.status(400).send({ status: false, message: "Quantity should be minimum 1" });    
        
        const findCart = await cartModel.findOne({userId}) 

        if(!findCart){
            let data = {userId}
            let items=[{productId,quantity}]

            data["items"]=items
            data.totalPrice=(productDoc.price)*quantity
            data.totalItems=items.length
            const newCart = await cartModel.create(data)
            return res.status(201).send({status:true,message:"Success",data:newCart})
        }

        let { _id, items, totalPrice } = findCart
        
        for (let i = 0; i < items.length; i++) {
            if (productId == items[i].productId) {

                const newPrice = (productDoc.price) * quantity + totalPrice
                items[i].quantity += quantity
                const newObj ={totalPrice:newPrice,items}

                const addToCart = await cartModel.findByIdAndUpdate(_id,newObj, { new: true })
                return res.status(201).send({ status: true, message: "Success", data: addToCart })
            }
        }

        const add= {productId,quantity}
        
        const newPrice = (productDoc.price)*quantity+totalPrice

        const addToCart = await cartModel.findByIdAndUpdate(_id,{$addToSet:{items:add},$set:{totalPrice:newPrice,totalItems:items.length+1}},{new:true})
        return res.status(201).send({status:true,message:"Success",data:addToCart})

    }
    catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getCart = async(req,res)=>{
    try{
    let userId = req.params.userId
    if (!validator.isValidObjectId(userId))
    return res.status(400).send({ status: false, message: "Please provide the valid userId" });

    const findUser = await userModel.findById( userId)
    if(!findUser) return res.status(404).send({status: false, message:"User does not exists"})

    if(userId!=req.userId)
    return res.status(403).send({status: false, message:"Unauthorised Access"})

    const findCart = await cartModel.findOne({ userId})
    if(!findCart) 
    return res.status(404).send({status: false, message:"cart does not exists"})


    return res.status(200).send({ status: true,message: 'Success',data:findCart})

}
catch(err){
    return res.status(500).send({status: false,message:err.message})}
}


const updateCart = async (req, res) => {
    try{
        const userId = req.params.userId
        const data = req.body
        const {productId, cartId, removeProduct} = data

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is invalid" });
        }

        const userByuserId = await userModel.findById(userId);

        if (!userByuserId) {
            return res.status(404).send({ status: false, message: 'user not found.' });
        }
        
        if (req.userId != userId) {
            return res.status(403).send({
              status: false,
              message: "Unauthorized access.",
            });
        }

        if (!validator.isValidValue(productId)) {
            return res.status(400).send({ status: false, messege: "please provide productId" })
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "productId is invalid" });
        }

        const findProduct = await productModel.findById(productId);
        
        if (!findProduct) {
            return res.status(404).send({ status: false, message: 'product not found.' });
        }

        if(findProduct.isDeleted == true){
            return res.status(400).send({ status:false, msg: "product is deleted" });
        }

        if (!validator.isValidValue(cartId)) {
            return res.status(400).send({ status: false, messege: "please provide cartId" })
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, msg: "cartId is invalid" });
        } 

        const findCart = await cartModel.findById(cartId);
    
        if (!findCart) {
            return res.status(404).send({ status: false, message: 'cart not found.' });
        }

        const findProductInCart = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } });
       
        if (!findProductInCart) {
            return res.status(404).send({ status: false, message: 'product not found in the cart.' });
        }

        if (!validator.isValidValue(removeProduct)) {
            return res.status(400).send({ status: false, messege: "please provide items to delete" })
        }

        if ((isNaN(Number(removeProduct)))) {
            return res.status(400).send({ status: false, message:'removeProduct should be a valid number' })
        }
        
        if ([0,1].indexOf(removeProduct)==-1) {
            return res.status(400).send({ status: false, message: 'removeProduct should be 0 or 1' })
        }
        let findQuantity = findCart.items.find(x => x.productId.toString() === productId)
        
        if (removeProduct == 0) {
            let totalAmount = findCart.totalPrice - (findProduct.price * findQuantity.quantity)
            let quantity = findCart.totalItems - 1
            let newCart = await cartModel.findByIdAndUpdate(
                cartId,
                { $pull: { items: { productId: productId } },
                $set: { totalPrice: totalAmount, totalItems: quantity } }, { new: true })

            return res.status(200).send({ status: true,
                message: 'Success', data: newCart })
        }

        if (removeProduct == 1) {
            let newAmount = findCart.totalPrice - findProduct.price;
            let items = findCart.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].productId.toString() === productId) {
                    items[i].quantity = items[i].quantity - 1;
                    if (items[i].quantity == 0) {
                        let noOfItems = findCart.totalItems - 1;
                        let newCart = await cartModel.findByIdAndUpdate(
                             cartId,
                            {
                                $pull: { items: { productId: productId } },
                                $set: { totalPrice: newAmount, totalItems: noOfItems },
                            },
                            { new: true }
                        );
                        return res.status(200).send({
                            status: true,
                            message: "Success",
                            data: newCart,
                        });
                    }
                }
            }

          let data = await cartModel.findOneAndUpdate(
            { _id: cartId },
            { totalPrice: newAmount, items: items },
            { new: true }
          );

          return res.status(200).send({
            status: true,
            message: "product in the cart updated successfully.",
            data: data,
          });
        }
    }
    catch(error){
        return res.status(500).send({ status: false, message: error.message });
    }
}


// const updateCart=async function(req,res){

//  try{


//         let data=req.body;
//         let userId=req.params.userId;
//         let cartId=data.cartId;
        
//         let productId=data.productId;
        
//         let removeProduct=data.removeProduct;
        
        
//         if(!cartId){
        
//             return res.status(400).send({status:false,msg:"carId key is missing"})
//         }
        
//         if(cartId && cartId==""){
        
//             return res.status(400).send({status:false,msg:"cartId cannot be sent empty"})
//         }
        
//         if(!productId){
        
//             return res.status(400).send({status:false,msg:"productId key is missing"})
//         }
        
//         if(productId && productId==""){
        
//             return res.status(400).send({status:false,msg:"productId cannot be sent empty"})
//         }
        
//         if(removeProduct<0 && removeProduct>1 && !Number.isInteger(removeProduct)){
        
//             return res.status(400).send({status:false,msg:"removeProduct key is invalid"})
//         }
//         if(!validator.isValidObjectId(userId)){
        
//             return res.status(400).send({status:false,mgs:"userId is not a valid objectId"})
//         }
        
//         if(!validator.isValidObjectId(cartId)){
        
//             return res.status(400).send({status:false,msg:"cartId is not a valid ObjectId"})
//         }
        
//         if(!validator.isValidObjectId(productId)){
        
//             return res.status(400).send({status:false,msg:"prodcutId is not a valid ObjecId"})
//         }
        
        
        
//         let userExists=await userModel.findById({_id:userId})
        
//         if(!userExists){
         
//           return res.status(404).send({status:false,msg:"no  user exists with this userId"})
//         }
        
//         let productExistsWithId=await productModel.findById({_id:productId})
        
//         if(!productExistsWithId){
        
//             return res.status(404).send({status:false,msg:"no products exists with this productId"})
//         }
        
//         let productIsNotDeleted=await productModel.findOne({_id:productId,isDeleted:false})
        
//         if(!productIsNotDeleted){
        
//             return res.status(404).send({status:false,msg:"product is already deleted"})
//         }
        
        
//         let cartExists=await cartModel.find({_id:cartId})
        
//         if(!cartExists){
        
//             return res.status(400).send({status:false,msg:"cart doesn not exists"})
//         }
        
//         let itemsArray=cartExists[0].items;
//         let totalPriceKey=cartExists[0].totalPrice;
//         let totalItemsKey=cartExists[0].totaItems;
//         if(itemsArray.length==0){
        
//             return res.status(404).send({status:"false",msg:"no items in the cart to delete"})
        
//         }
        
//         if(totalPriceKey==0){
        
//             return res.status(404).send({status:false,msg:"total Price is empty"})
//         }
        
//         if(totalItemsKey==0){
        
//             return res.status(404).send({status:false,msg:" total Items is empty"})
//         }
        
        
//         if(removeProduct==0)
//         {
//             let idOfProduct=productIsNotDeleted._id;
//             idOfProduct=idOfProduct.toString();
//             let newArray=[]
//             let i;
//             let j;
//             let k=0;
//             let cartArray=await cartModel.find({_id:cartId,productId:productId,isDeleted:false})
//             for(i=0;i<cartArray[0].items.length;i++)
//             {
//               if(cartArray[0].items[i].productId.toString()==idOfProduct)
//               break;
//             }
            
        
//             if(cartArray[0].totalItems<=0){
//                 cartArray[0].totalItems=0;
//                 cartArray[0].items.length=0;
//                 cartArray[0].totalPrice=0
//                 return res.status(400).send({status:false,msg:"cart is already empty"})
                
//             }
          
//             else if(cartArray[0].items.length==0){
              
//                 totalItems=0;
//                 cartArray[0].totalPrice=0;
//                 return res.status(400).send({status:false,msg:"cart is empty as array is empty"})
        
//             }
        
//             else if(cartArray[0].totalPrice<=0)
//             {
//               cartArray[0].totalPrice=0;
//               totalItems=0;
//               cartArray[0].items.length=0;
            
//             }
            
//             for(j=0;j<cartArray[0].items.length;j++){
        
//                if(j==i)
//                {
//                continue;
//                }
//                else
//                {
//                newArray[k]=cartArray[0].items[j]
//                k++
//                }
        
//             }
//             console.log(newArray)
//             let totalPrice;
//             let noOFProductDeleted;
//             let priceOfTheProduct;
        
            
//             cartArray[0].totalItems=cartArray[0].totalItems-1;  
            
//             priceOfTheProduct=productIsNotDeleted.price;
           
//             noOFProductDeleted=cartArray[0].items[i].quantity;
           
//             totalPrice=cartArray[0].totalPrice;
        
//             totalPrice=totalPrice-(priceOfTheProduct*noOFProductDeleted)
        
//             if(cartArray[0].totalItems==0 || cartArray[0].items.length==0)
//             totalPrice=0;
//             else if(totalPrice<=0)
//             totalPrice=0
//             else
//             totalPrice=totalPrice;
            
//             let obj=new Object(cartArray[0])
//             obj.items=newArray;
//             obj.totalPrice=totalPrice
           
        
//             let updatedData=await cartModel.findOneAndUpdate(
        
//               {_id:cartId},
//               {$set:obj},
//               {new:true,upsert:true}
//         )
//         if(!updatedData){
        
//             return res.status(500).send({status:false,msg:"cart is not updated"})
//         }
        
//         return res.status(200).send({status:false,msg:"success",data:updatedData})
        
//         }
        
        
        
//         else if(removeProduct==1){
              
//             let idOfProduct=productIsNotDeleted._id;
//             idOfProduct=idOfProduct.toString()
//             let i;
//             let j;
//             let cartArray=await cartModel.find({_id:cartId,productId:productId,isDeleted:false})
        
//            let totalItems=cartArray[0].totalItems
//             if(totalItems<=0){
//             totalItems=0;
//             cartArray[0].items.length=0;
//             return res.status(400).send({status:false,msg:"cart is already empty"})
            
//             }
           
//           else if(cartArray[0].items.length==0)
//           {
//               cartArray[0].totalItems=0;
//               return res.status(404).send({status:400,msg:"cart is already empty and empty array"})
        
//           }
        
//           else if(cartArray[0].totalPrice<=0)
//           {
//             cartArray[0].totalPrice=0;
//             totalItems=0;
//             cartArray[0].items.length=0;
          
//           }
        
          
//             for(i=0;i<cartArray[0].items.length;i++)
//             {  
//               if(cartArray[0].items[i].productId.toString()==idOfProduct){
//               break;
//               }
//             }
            
//            if(cartArray[0].items[i].quantity<=0)
//            {
            
//             cartArray[0].items[0].quantity=0
        
//             return res.status(404).send({status:false,msg:"items with this Id not exist in the cart"})
        
//            }
            
//            let newArray=[]
//             for(j=0;j<cartArray[0].items.length;j++){
        
//                if(j==i){
//                cartArray[0].items[j].quantity=cartArray[0].items[j].quantity-1;
//                if(cartArray[0].items[j].quantity==0){
        
//                  continue;
//                }
//                else
//                {
//                    newArray=cartArray[0].items[j];
//                }
            
//                }
//                else{
//                cartArray[0].items[j].quantity=cartArray[0].items[j].quantity
//                newArray=cartArray[0].items[j]
//                }
//             }
//               console.log(newArray)
        
            
//               if(cartArray[0].items[i].quantity==0){
//               totalItems=cartArray[0].totalItems
//               totalItems=totalItems-1;
//               }
              
        
//             let totalPrice;
//             let priceOfProduct
        
            
//             totalPrice=cartArray[0].totalPrice;
//             priceOfProduct=productIsNotDeleted.price;
//             totalPrice=totalPrice-priceOfProduct;
        
//             if(totalItems==0 || cartArray[0].items.length==0)
//             totalPrice=0;
//             else if(totalPrice<=0)
//             totalPrice=0;
//             else
//             totalPrice=totalPrice;
//             let obj = new Object(cartArray[0])
//             obj.items=newArray;
//             obj.totalItems=totalItems;
//             obj.totalPrice=totalPrice
        
            
//             let updatedData=await cartModel.findOneAndUpdate(
        
//                {_id:cartId},
//                {$set:obj},
//                {new:true}
        
//              )
               
//              if(!updatedData){
        
//                 return res.status(500).send({status:false,msg:"cart is not updated"})
//              }
               
//              return res.status(500).send({status:false,msg:"success",data:updatedData})
//             }
        
        
        
        
//  }catch(error){
//     return res.status(500).send({status: false,message:error.message})
//  } 
//     }
   
const deleteCart = async(req,res)=>{
    let userId = req.params.userId

    if (!validator.isValidObjectId(userId))
    return res.status(400).send({ status: false, message: "Please provide the valid userId" });

    const findUser = await userModel.findById( userId)
    if(!findUser) return res.status(404).send({status: false, message:"User does not exists with given id"})

    if(userId!=req.userId)
    return res.status(403).send({status: false, message:"Unauthorised Access"})

    const findCart = await cartModel.findOne({userId})
    if(!findCart)
    return res.status(404).send({status: false, message:"cart does not exists"})

    if(findCart.totalPrice==0)
    return res.status(400).send({status: false, message:"Cart is empty."})
      
    await cartModel.findOneAndUpdate({userId},{$set:{items:[],totalPrice:0,totalItems:0}})
    return res.status(204).send({status: true, message:"Products in cart deleted successfully"})

}


module.exports.createCart=createCart
module.exports.getCart=getCart
module.exports.updateCart=updateCart
module.exports.deleteCart=deleteCart