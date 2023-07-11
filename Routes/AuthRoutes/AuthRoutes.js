const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const { SingupValidate, LoginValidate } = require('../../validate');
const { SignupUser, LoginUser, ForgotPassword, ResetPassword, DeleteAllCustomer, UpdateTheUser } = require("../../Controllers/AuthControllers/CustomerAuth")
const { AddVendor, VendorLogin, VendorForgotPasword, VendorResetPassword, DeleteVendors } = require("../../Controllers/AuthControllers/VendorAuthController")
const { GetAddTheAdmin, AdminLoginApi, UpdateAdmin, AdminForgotPassword, AdminResetPassword } = require('../../Controllers/AuthControllers/AdminAuthController')
const { VerifyOptFormDb, SendOtp } = require("../../Controllers/Others/SendOtp")


// signup the user
router.post("/signup", SignupUser);
// login the user 
router.post("/login", LoginUser);
// forgot password
router.post("/forgot-password", ForgotPassword);
// reset password
router.post("/reset-password", ResetPassword);
// delete all user 
router.delete("/deleteall", DeleteAllCustomer);
// Update the Customer
router.patch("/update/:id", UpdateTheUser)
// update password
// router.post("/update-pass/:id")

// router.post("/sendOtp/:number", SendOtpForVerify);


// vendor Login And Signup 

router.post("/vendor/signup", AddVendor);
router.post("/vendor/login", VendorLogin);
router.post("/vendor/forgot-password", VendorForgotPasword);
router.post("/vendor/reset-password", VendorResetPassword);
router.delete("/vendor/deleteall", DeleteVendors);



// admin SOme Routes 
router.post("/admin/signup", GetAddTheAdmin);
// admin login 
router.post("/admin/login", AdminLoginApi);
// admin forgot password
router.post("/admin/forgot-password", AdminForgotPassword);
// admin reset password 
router.post("/reset-password", AdminResetPassword);
// admin update the data 
router.post("/admin/update", UpdateAdmin);


// SEND OTP FROM TWILLO 
router.get("/sendopt/:number", SendOtp);
router.get("/verifyotp/:key/:otp", VerifyOptFormDb);





module.exports = router