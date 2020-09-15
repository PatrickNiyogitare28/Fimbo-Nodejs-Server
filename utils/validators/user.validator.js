const Joi = require('joi');
const string = require('joi/lib/types/string');
function validateRegistationUserData(user){
    const Schema = {
        firstname: Joi.string().min(2).max(100).required(),
        lastname: Joi.string().min(2).max(100).required(),
        email: Joi.string().min(3).max(100).required(),
        password: Joi.string().required(),
        phone: Joi.string().required().min(10).max(12)
    
    }
   
    return Joi.validate(user,Schema);
 }

 function validateLoginUserData(user){
    const Schema = {
        phone: Joi.string().required().min(10).max(12),
        password: Joi.string().required()
    }
    return Joi.validate(user,Schema)
 }

 function updateUserValidator(user){
    const Schema = {
        firstname: Joi.string().min(2).max(100).required(),
        lastname: Joi.string().min(2).max(100).required(),
        email: Joi.string().min(3).max(100).required(),
        level: Joi.number().required(),
        phone: Joi.string().required().min(10).max(12)
    
    }
   
    return Joi.validate(user,Schema);
 }

 function updateUserProfile(profile){
    const Schema = {
        userId: Joi.string().required().min(3).max(95),
        firstname: Joi.string().min(2).max(100).required(),
        lastname: Joi.string().min(2).max(100).required(),
        phone: Joi.string().required().min(10).max(12),
    }
    return Joi.validate(profile,Schema)
 }

 function updateUserPassword(data){
     const Schema = {
        userId: Joi.string().required().min(3).max(95),
        oldPassword: Joi.string().required().max(200),
        newPassword: Joi.string().required().min(6).max(200)
     }
     return Joi.validate(data,Schema)
 }
module.exports.validateRegistationUserData = validateRegistationUserData;
module.exports.validateLoginUserData = validateLoginUserData;
module.exports.updateUserValidator = updateUserValidator;
module.exports.updateUserProfile=updateUserProfile;
module.exports.updateUserPassword = updateUserPassword;