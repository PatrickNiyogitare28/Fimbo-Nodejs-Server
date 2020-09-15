const Joi = require('joi')

function validateAddress(address){
    const Schema = {
        user : Joi.string().min(5).max(100),
        country : Joi.string().min(3).max(200),
        city : Joi.string().min(1).max(200),
        streetCode: Joi.string().min(1).max(200)
    }
    return Joi.validate(address,Schema)
}
module.exports.validateAddress = validateAddress;