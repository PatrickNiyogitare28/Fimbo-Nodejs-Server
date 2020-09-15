const Joi = require('joi')
function foundProductValidator(body){
    const Schema = {
        seller: Joi.string().min(3).max(100).required(),
        order: Joi.required()
    }
    return Joi.validate(body,Schema)
}
module.exports.foundProductValidator = foundProductValidator;