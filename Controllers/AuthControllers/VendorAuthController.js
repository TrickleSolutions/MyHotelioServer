const VendorModel = require("../../Model/HotelModel/VendorModel");
const SendMail = require("../Others/Mailer");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption");
const { isEmail, isMobileNumber } = require("../utils");
require("dotenv").config();
const jwt = require('jsonwebtoken')



const AddVendor = async (req, res) => {
    const formData = req.body

    // check the user is already present or not
    const isUser = await VendorModel.findOne({ partnerEmail: req.body.partnerEmail })
    if (isUser) return res.status(409).json({ error: true, message: "Email Already Registered" })
    // mobile no check
    const isUserWithMobile = await VendorModel.findOne({ mobileNo: req.body.mobileNo })
    if (isUserWithMobile) return res.status(409).json({ error: true, message: "Mobile Number Already Registered" })

    // make the password hashed  
    // make the password as a hash password 
    const hashPassword = EncryptPassword(req.body.password)
    // const salt = await bcrypt.genSalt(10)
    // const hashPassword = await bcrypt.hash(req.body.password, salt)

    try {
        const result = await new VendorModel({
            ...formData,
            password: hashPassword.hashedPassword,
            secretKey: hashPassword.salt
        }).save()
        res.status(200).json({
            error: true,
            data: result
        })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}


const VendorLogin = async (req, res) => {

    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.partnerEmail) === true ? "mobileNo" : isEmail(req.body.partnerEmail) === true ? "partnerEmail" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.partnerEmail }

    try {
        const result = await VendorModel.findOne(credential)
        if (!result) return res.status(404).json({ error: true, message: "No User Found" })
        const { passsword, ...rest } = result
        // ver
        // compare the password  
        // const isPasswordCorrect = bcrypt.compare(req.body.password, result.password)
        const isPasswordCorrect = comparePassword(req.body.password, result.password, result.secretKey)
        if (!isPasswordCorrect) return res.status(400).json({ error: true, message: "Password is Incorrect" })

        const accesstoken = jwt.sign(rest, process.env.SECRET_CODE)
        res.header("access-token", accesstoken)
        res.status(200).json({ error: false, data: result })

    } catch (error) {
        res.status(500).json(error)
    }
}

// forgot Password  

const VendorForgotPasword = async (req, res) => {

    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.partnerEmail) === true ? "mobileNo" : isEmail(req.body.partnerEmail) === true ? "partnerEmail" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.partnerEmail }

    // find the user 
    const isUser = await VendorModel.findOne(credential);
    if (!isUser) return res.status(404).json({ error: true, message: "No User Found" })

    // generate the resetlink
    const resetUrl = crypto.randomBytes(20).toString('hex')

    // store the link in the person db
    isUser.resetLink = resetUrl;
    isUser.resetDateExpire = Date.now() + 120000  // resetLink Valid only for 1 hour
    await isUser.save();

    // prepare a mail to send reset mail
    const mailOptions = {
        from: process.env.SENDEREMAIL,
        to: req.body.partnerEmail,
        subject: 'Reset Password',
        text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${req.headers.origin}/reset-password/${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    // send Mail 
    const send = SendMail(mailOptions);
    if (!send) return res.status(400).json("Email Not Sent")

    res.status(200).json("reset email sended successfully")

}





// reset my password 

const VendorResetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;

    // find user with reset Link
    const user = await VendorModel.findOne({
        resetLink: resetLink,
        resetDateExpire: { $gt: new Date(Date.now()) }
    });
    if (!user) return res.status(400).json({ error: true, message: "Invalid or expired token'" });

    try {
        // convert the password in encryptedway
        const hashedPassword = EncryptPassword(newPassword)
        // check the the reset time is expired or not 
        user.password = hashedPassword.hashedPassword;
        user.secretKey = hashedPassword.salt
        user.resetLink = undefined;
        user.resetDateExpire = undefined;
        await user.save();
        res.status(200).json({ error: false, message: "password Changed Successfully" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}




module.exports = { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword }