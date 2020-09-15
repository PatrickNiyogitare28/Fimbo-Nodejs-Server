const Joi = require('joi');

function validateProduct(product){
    const Schema = {
        
        prod_name: Joi.string().min(3).max(50).required(), 
        prod_seller: Joi.string().min(5).max(50).required(),
        prod_category: Joi.required(), 
        prod_mark: Joi.required(),  
        prod_collection: Joi.required(),
        details: Joi.string().max(300).required(),
        price: Joi.required(),
        usedStatus: Joi.string().required()
    }
   
    return Joi.validate(product,Schema);
 }
module.exports.validateProduct = validateProduct;