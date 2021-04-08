const Joi = require('joi');

function productsMarksValidator(mark){
  const Schema = {
      mark_name: Joi.string().required().min(3).max(60)
  }
  return Joi.validate(mark,Schema);
}
module.exports.productsMarksValidator = productsMarksValidator;