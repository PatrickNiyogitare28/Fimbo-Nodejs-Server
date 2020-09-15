const Joi = require('joi');

function productsCollectionsValidator(collection){
  const Schema = {
      collection_name: Joi.string().required().min(3).max(60)
  }
  return Joi.validate(collection,Schema);
}
module.exports.productsCollectionsValidator = productsCollectionsValidator;