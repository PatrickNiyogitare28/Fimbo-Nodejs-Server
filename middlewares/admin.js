const config = require('config')
const jwt  =  require('jsonwebtoken')

function admin(req,res,next){
    const token = req.header('x-auth-token')
    if(!token) return res.send('token missing..').status(401)
    try {
        const decoded = jwt.verify(token,config.get('jwtPrivateKey'))
        const isAdmin = decoded
      
        if(isAdmin.level == 2){
            next()
        }
        else{
          return  res.send({
                message: "admin access denied",
                success: "false",
                status: 404
            }).status(404);
        }
       
    } catch (err) {
       return  res.send(err).status(400)
    }

}
module.exports = admin