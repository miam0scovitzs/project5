const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../aws/aws");
const validator = require("../validations/validator");
const bcrypt = require("bcrypt");
////////////////////////////aws////////////////////////////////

const createUser = async function (req, res) {
    try {
        const body = req.body;

        if (!validator.isValidDetails)
            return res
                .status(400)
                .send({ status: false, message: "Invalid Request" });

        let { fname, lname, email, phone, password } = body;
        const addressString = req.body.address;

        if (!validator.isValidValue(fname))
            return res
                .status(400)
                .send({ status: false, message: "Please provide First name" });

        if(!validator.isValidName(fname)) 
            return res
                .status(400)
                .send({ status: false, message: "Please provide valid First name" });      

        if (!validator.isValidValue(lname))
            return res
                .status(400)
                .send({ status: false, message: "Please provide Last name" });

        if(!validator.isValidName(lname)) 
            return res
                .status(400)
                .send({ status: false, message: "Please provide valid Last name" });       

        if (!validator.isValidValue(email))
            return res
                .status(400)
                .send({ status: false, message: "Please provide Email" });

        if (!validator.isValidEmail(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide valid Email Address" });
        }

        let isDuplicateEmail = await userModel.findOne({ email });
        if (isDuplicateEmail) {
            return res
                .status(409)
                .send({ status: false, message: "email already exists" });
        }

        if (!validator.isValidValue(password)) {
            return res
                .status(400)
                .send({ status: false, messege: "Please provide password" });
        }

        if (password.length < 8 || password.length > 15) {
            return res
                .status(400)
                .send({ status: false, message: "Password must be of 8-15 letters." });
        }

        if (!validator.isValidValue(phone)) {
            return res
                .status(400)
                .send({ status: false, messege: "Please provide phone number" });
        }

        if (!validator.isValidPhone(phone)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide valid phone number" });
        }

        let isDuplicatePhone = await userModel.findOne({ phone });
        if (isDuplicatePhone)
            return res
                .status(409)
                .send({ status: false, message: "phone no. already exists" });

        if (!validator.isValidValue(addressString)) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide address" });
        }
        const address = JSON.parse(addressString);

        if (
            !address.shipping ||
            !address.shipping.street ||
            !address.shipping.city ||
            !address.shipping.pincode
        )
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please provide Full shipping address",
                });

        if (
            !address.billing ||
            !address.billing.street ||
            !address.billing.city ||
            !address.billing.pincode
        )
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please provide Full billing address",
                });

        if (!validator.isValidPincode(address.shipping.pincode))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please provide valid pincode in shipping",
                });

        if (!validator.isValidPincode(address.billing.pincode))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please provide valid pincode in billing",
                });

        let files = req.files;
        if (!(files && files.length > 0)) {
            return res
                .status(400)
                .send({ status: false, message: "profile image is required" });
        }

        let profileImage = await uploadFile(files[0]);

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        const bodyObject = {
            fname,
            lname,
            email,
            phone,
            password,
            address,
            profileImage,
        };

        const newUser = await userModel.create(bodyObject);
        return res
            .status(201)
            .send({ status: true, message: "Success", data: newUser });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};
module.exports.createUser = createUser;
