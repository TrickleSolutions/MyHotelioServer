const { SingupValidate, LoginValidate } = require("../../validate");
const { EncryptPassword, comparePassword } = require("../Others/PasswordEncryption")
const CustomerAuthModel = require("../../Model/CustomerModels/CustomerAuthModel")
const jwt = require("jsonwebtoken");
const { isMobileNumber, isEmail } = require("../utils");
require('dotenv').config();
const crypto = require('crypto');
const SendMail = require("../Others/Mailer");
const { VerifyOptFormDb } = require("../Others/SendOtp");
const OtpModel = require("../../Model/other/OtpVerifyModel");
const { EmailForResetLink } = require("../../Model/other/EmailFormats");
const VerificationModel = require("../../Model/other/VerificationModel");


const CheckOtpVerify = async (isLoginwith, otp, mobileNo) => {
    let verification;
    // Verify OTP
    if (isLoginwith === 'mobileNo') {
        verification = await VerificationModel.findOne({
            verificationType: "Mobile",
            verificationOtp: otp,
            sendedTo: mobileNo,
            OtpExpireTime: { $gt: new Date(Date.now()) }
        });
    } else {
        verification = await VerificationModel.findOne({
            verificationType: "Email",
            verificationOtp: otp,
            sendedTo: mobileNo,
            OtpExpireTime: { $gt: new Date(Date.now()) }
        });
    }

    return verification

}




const Authentication = async (req, res) => {
    const { mobileNo, otp, password } = req.query;

    let isLoginwith;
    if (isMobileNumber(mobileNo)) {
        isLoginwith = "mobileNo";
    } else if (isEmail(mobileNo)) {
        isLoginwith = "email";
    } else {
        return res.status(400).json({ error: true, message: "Please Enter a Valid Email or Mobile No" });
    }

    // check if user 
    const isUser = await CustomerAuthModel.findOne({ [isLoginwith]: mobileNo })
    const isOtpVerified = await CheckOtpVerify(isLoginwith, otp, mobileNo)

    if (isUser) {
        if (isOtpVerified) return res.status(200).json({ error: false, message: "login success with otp", data: isUser })
        const comparePass = isUser.password === password
        if (!comparePass) return res.status(400).json({ error: false, message: "enter a valid otp or password " })
        return res.status(200).json({ error: false, message: "loging successfully", data: isUser })
    }

    if (!isOtpVerified) return res.status(400).json({ error: true, message: "please enter a valid otp" })



    // Delete the verification document
    await VerificationModel.deleteOne({ _id: isOtpVerified._id });

    // Find user if exists
    // const isUser = await CustomerAuthModel.findOne({ [isLoginwith]: mobileNo });
    // Create a new user
    try {
        const isCreated = await new CustomerAuthModel({
            [isLoginwith]: mobileNo,
            isVerified: [mobileNo]
        }).save();
        if (!isCreated) {
            return res.status(400).json({ error: true, message: "user not registered try again" });
        }
        res.status(201).json({ error: false, data: isCreated });
    } catch (error) {
        res.status(500).json({ error });
    }
};

// 


// signup 
const SignupUser = async (req, res) => {

    try {
        // // lets validate the data
        // const { error, value } = SingupValidate(req.body);
        // if (error) return res.status(400).json(error.details[0].message);


        // username email resgistered or not check
        // const isUserFound = await CustomerAuthModel.findOne({ email: req.body.email })
        // if (isUserFound) return res.status(409).json("Email Already Registered")

        // check the mobile no is registered or not 
        const isMobile = await CustomerAuthModel.findOne({ mobileNo: req.body.mobileNo })
        if (isMobile) return res.status(409).json("Mobile No Already Registered")

        // verify the otp 
        const isVarified = await VerificationModel.findOne({
            verificationOtp: req.body.otp,
            sendedTo: req.body.mobileNo,
            OtpExpireTime: { $gt: new Date(Date.now()) }
        })

        if (!isVarified) return res.status(400).json({ error: true, message: "otp invalid or expired" })


        // encrypt the password
        // const hashPassword = EncryptPassword(req.body.password)

        // my formdata
        const formdata = new CustomerAuthModel({
            ...req.body,
            // password: hashPassword.hashedPassword,
            // secretKey: hashPassword.salt,
            isNumberVerified: true,
        })

        const saveData = await formdata.save()
        res.status(200).json(saveData);
    } catch (error) {
        res.status(500).json(error)
    }
}



// Login Controller 
// const LoginUser = async (req, res) => {

//     try {
//         // validate the data  
//         // const { error, value } = LoginValidate(req.body);
//         // if (error) return res.status(400).json(error.details[0].message)



//         // check the user is login with email or Number 
//         const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
//         if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

//         const credential = { [isLoginwith]: req.body.email }


//         // find the user 
//         const User = await CustomerAuthModel.findOne(credential);
//         if (!User) return res.status(404).json({ message: "User Not Found" });
//         const { password, ...rest } = User

//         // compare the password 
//         const compare = comparePassword(req.body.password, User.password, User.secretKey)
//         // const compare = bycrypt.compare(req.body.password, User.password)
//         if (!compare) return res.status(404).json({ message: "Password Incorrect" })

//         //  jenerate the jwt token  
//         const token = jwt.sign(rest, process.env.SECRET_CODE)
//         res.header("access-token", token)
//         res.status(200).json(User)
//     } catch (error) {
//         res.status(500).json(error)
//     }

// }

const LoginUser = async (req, res) => {
    const { mobileNo, otp, password } = req.query;

    if (!otp && !password) return res.status(400).json({ error: true, message: 'please enter otp or password any of things' })

    // check the account with mobile no
    const isFound = await CustomerAuthModel.findOne({ mobileNo: mobileNo })
    if (!isFound) return res.status(404).json({ error: true, message: "No user found with this number" })

    // verify the otp 
    const isVarified = await VerificationModel.findOne({
        verificationOtp: otp,
        sendedTo: mobileNo,
        OtpExpireTime: { $gt: new Date(Date.now()) }
    })

    if (!isVarified) return res.status(400).json({ error: true, message: "otp invalid or expired" })

    const jwtPayload = {
        _id: isFound._id,
        mobileNo: isFound.mobileNo,
    }
    //  jenerate the jwt token  
    const token = jwt.sign(jwtPayload, process.env.SECRET_CODE)
    res.header("access-token", token)
    res.status(200).json(isFound)
}

// forgot Password  

const ForgotPassword = async (req, res) => {

    // check the user is login with email or Number 
    const isLoginwith = isMobileNumber(req.body.email) === true ? "mobileNo" : isEmail(req.body.email) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    const credential = { [isLoginwith]: req.body.email }

    // find the user 
    const isUser = await CustomerAuthModel.findOne(credential);
    if (!isUser) return res.status(404).json({ error: true, message: "No User Found" })

    // generate the resetlink
    const resetUrl = crypto.randomBytes(20).toString('hex')

    // store the link in the person db
    isUser.resetLink = resetUrl;
    isUser.resetDateExpires = Date.now() + 120000  // resetLink Valid only for 1 hour
    await isUser.save();

    // prepare a mail to send reset mail
    const mailOptions = {
        from: process.env.SENDEREMAIL,
        to: req.body.email,
        subject: 'Reset Password',
        html: EmailForResetLink(isUser.name, `${req.header.origin}/reset-password/${resetUrl}`)
    };

    // send Mail 
    const send = SendMail(mailOptions);
    if (!send) return res.status(400).json("Email Not Sent")

    res.status(200).json("reset email sended successfully")

}





// reset my password 

const ResetPassword = async (req, res) => {
    const { resetLink, newPassword } = req.body;

    // find user with reset Link
    const user = await CustomerAuthModel.findOne({
        resetLink: resetLink,
        resetDateExpires: { $gt: new Date(Date.now()) }
    });
    if (!user) return res.status(400).json({ error: true, message: "Invalid or expired token'" });

    try {
        // convert the password in encryptedway
        const hashedPassword = EncryptPassword(newPassword)
        // check the the reset time is expired or not 
        user.password = hashedPassword.hashedPassword;
        user.secretKey = hashedPassword.salt
        user.resetLink = undefined;
        user.resetDateExpires = undefined;
        await user.save();
        res.status(200).json({ error: false, message: "password Changed Successfully" })
    } catch (error) {
        res.status(500).json({ error: error })
    }
}



// delete al the user 
const DeleteAllCustomer = async (req, res) => {
    CustomerAuthModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "" })
    }).catch((error) => {
        console.log(error)
    })
}

// update the user 
const UpdateTheUser = async (req, res) => {
    // check the user Exists 
    const id = req.params.id

    try {
        const response = await CustomerAuthModel.findById(id)
        if (!response) return res.status(404).json({ error: true, message: "No user Found" })

        // let Update the user 
        const isUpdated = await CustomerAuthModel.findByIdAndUpdate(id, req.body, { new: true })
        if (!isUpdated) return res.status(400).json({ error: true, message: "No Updated Something error" })

        res.status(200).json({ error: false, data: isUpdated });
    } catch (error) {
        res.status(500).json({ error })
    }
}


// Update the password 
const UpdateThePassword = async (req, res) => {
    // id of the user form the params
    const id = req.params.id
    const otpKey = req.body.key
    const otp = req.body.otp
    const newPassword = req.body.password

    try {
        // find the user by id 
        const isUser = await CustomerAuthModel.findById(id)
        if (!isUser) return res.status(400).json({ error: true, message: "User Auth Error Try Again" });

        // verify the otp in db 
        const isVerified = await OtpModel.findOne({
            otpKey: otpKey,
            otpExpiresTime: { $gt: new Date(Date.now()) },
        });
        // If no OTP request is found, return a 404 error
        if (!isVerified) return res.status(404).json({ error: true, message: "Otp Expired " });

        // If the OTP value doesn't match the stored OTP, return a 404 error
        if (isVerified.otp !== otp) return res.status(404).json({ error: true, message: "OTP Not Matched" });

        // encrypt the password 
        const encryptedPassword = EncryptPassword(newPassword)

        // update the password
        const updatePassword = await CustomerAuthModel.findByIdAndUpdate(id, {
            password: encryptedPassword.hashedPassword,
            secretKey: encryptedPassword.salt
        }, { new: true })
        if (!updatePassword) return res.status(400).json({ error: true, message: "error in updating data" })

        res.status(200).json({ error: true, data: updatePassword, message: "Password Updated Successfully" })
    } catch (error) {
        res.status(500).json(error)
    }
}


const GetUserDataByField = async (req, res) => {
    const { field } = req.query

    const isLoginwith = isMobileNumber(field) === true ? "mobileNo" : isEmail(field) === true ? "email" : "Invalid Input"
    if (isLoginwith === "Invalid Input") return res.status(400).json({ error: true, message: "Please Enter the Valid Email Or Mobile No" })

    try {
        const response = await CustomerAuthModel.findOne({ [isLoginwith]: field })
        if (!response) return res.status(404).json({ error: true, message: "no user found" })
        res.status(200).json({ error: false, data: response })
    } catch (error) {
        res.status(500).json({ error })
    }

}



module.exports = { SignupUser, LoginUser, ForgotPassword, ResetPassword, DeleteAllCustomer, UpdateTheUser, UpdateThePassword, Authentication, GetUserDataByField }