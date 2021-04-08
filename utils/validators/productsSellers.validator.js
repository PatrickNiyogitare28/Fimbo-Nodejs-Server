const Joi = require('joi');
const { join } = require('path');

function validateSeller(seller){
    const Schema = {
        seller_name: Joi.string().min(2).max(100).required(),
        seller_watsapp_phone: Joi.string().required().min(10).max(12),
        seller_contact_phone : Joi.string().required().min(4).max(12),
        seller_country : Joi.string().min(3).max(50).required(),
        seller_district : Joi.string().min(3).max(50).required(),
        seller_sector : Joi.string().min(3).max(50).required(),
        seller_email: Joi.string().min(2).max(100).required(),
        seller_town: Joi.string().min(3).max(50).required(),
        bussiness_description: Joi.string().required()
    }
   
    return Joi.validate(seller,Schema);
 }
 function validateSellerPassword(password){
     const Schema = {
         sellerId: Joi.string().required().max(100),
         password: Joi.string().min(6).max(200).required()
     }
     return Joi.validate(password,Schema)
 }
 function validateResendEmailVeriCode(body){
     const Schema = {
         sellerId: Joi.string().max(100).required()
     }
     return Joi.validate(body,Schema);
 }
module.exports.validateSeller = validateSeller;
module.exports.validateSellerPassword = validateSellerPassword;
module.exports.validateResendEmailVeriCode = validateResendEmailVeriCode;