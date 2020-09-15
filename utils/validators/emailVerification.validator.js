const Joi = require('joi');

function validateEmailVerBody(data){
   const Schema = {
       userId: Joi.string().min(5).max(100),
       email: Joi.string().min(3).max(100)
   }
   return Joi.validate(data,Schema);
}

function validateEmailCode(data){
    const Schema = {
        userId: Joi.string().min(5).max(100),
        code: Joi.string().min(6).max(6)
    }
    return Joi.validate(data,Schema);
}
module.exports.validateEmailVerBody = validateEmailVerBody;
module.exports.validateEmailCode = validateEmailCode;