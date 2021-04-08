const Joi= require('joi');
function validateNewOrder(order){
    const Schema = {
        orderName: Joi.string().required().min(2).max(200),
        description: Joi.required(),
        user: Joi.string().max(200).required()
    }
    return Joi.validate(order,Schema);
}
module.exports.validateNewOrder=validateNewOrder;