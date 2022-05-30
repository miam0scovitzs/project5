const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");
const validator = require("../validations/validator");

const createCart = async (req, res) => {
    try{
        const userId = req.params.userId
        if (!validator.isValidObjectId(userId))
        return res.status(400).send({ status: false, message: `${userId} is NOT a valid productID` });

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

                const addToCart = await cartModel.findByIdAndUpdate(_id, { $set: { quantity: { $inc: quantity }, totalPrice: newPrice, totalItems: items.length } }, { new: true })
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
module.exports.createCart=createCart