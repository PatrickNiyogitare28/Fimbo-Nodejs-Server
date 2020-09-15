const Joi = require('joi');

function productsCategoriesValidator(category){
  const Schema = {
      category_name: Joi.string().required().min(3).max(60)
  }
  return Joi.validate(category,Schema);
}
module.exports.productsCategoriesValidator = productsCategoriesValidator;