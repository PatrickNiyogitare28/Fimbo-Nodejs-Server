const Joi = require('joi');
function validatePlan(plan){
    const Schema  = {
        plan_name: Joi.string().min(3).max(50).required(),
        price: Joi.number().required(),
        description:Joi.required(),
        max_products:Joi.number().required()
    }
    return Joi.validate(plan,Schema);
}
function updatePlanValidator(plan){
    const Schema  = {
        planId: Joi.required(),
        plan_name: Joi.string().min(3).max(50).required(),
        price: Joi.number().required(),
        description:Joi.required(), 
        max_products:Joi.number().required()
    }
    return Joi.validate(plan,Schema);
}
module.exports.validatePlan=validatePlan;
module.exports.updatePlanValidator=updatePlanValidator;