const jwt = require('jsonwebtoken');
const config = require('config')

// const config = require('../../config/config');
function jwtSignUser(user){
//  const QUOLTER_DAY = 60*60*6;
//  return jwt.sign(user, config.authentication.jwtSecret,{
//      expiresIn: QUOLTER_DAY
//  })  

const token  =jwt.sign(user,config.get('jwtPrivateKey'))
return token
}
module.exports.jwtSignUser = jwtSignUser;