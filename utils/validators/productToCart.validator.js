const Joi = require('joi');

function validateData(data){
    const Schema = {
        customer: Joi.string().min(3).max(100).required(),
        product: Joi.string().min(3).max(50).required(), 
        quantity: Joi.number().required(),
        date: Joi.string().min(8).max(10).required(), 
        time: Joi.string().min(3).max(5).required(),  
       }
   return Joi.validate(data,Schema);
 }
module.exports.validateData = validateData;