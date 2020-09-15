const config = require('config')
const jwt  =  require('jsonwebtoken')
const express = require('express');
const router = express.Router();

router.get('/jwt',(req,res)=>{
    const token = req.header('x-auth-token')
    if(!token) return res.send({
        success: false,
        status: 401,
        message: "unauthorized"
    }).status(401)
    
        const decoded = jwt.verify(token,config.get('jwtPrivateKey'))
        const user = decoded;
        req.getConnection((err,conn)=>{
            if(err) return res.send({success: false,status: 500,message: err}).status(400)
               conn.query('SELECT * FROM users WHERE user_id = ?',[user.user_id],(err,foundUser)=>{
                  if(err) {return res.send({success: false,status: 400,message: err }).status(400)}
                    else if(foundUser.length == 0) {return res.send({success: false,status: 404,message: "User not found "}).status(404)}
                    else if(foundUser.length > 0){
                    return res.send({
                    success: true,status: 200, message:"authorized",userId: foundUser[0].user_id, firstname: foundUser[0].firstname,
                    lastname: foundUser[0].lastname,email: foundUser[0].email,level: foundUser[0].level,phone: foundUser[0].phone,created: foundUser[0].created
                  })
                }
            })
        })
    })

  router.get('/vendor/jwt',(req,res)=>{
    const token = req.header('x-auth-token')
    if(!token) return res.send({
        success: false,
        status: 401,
        message: "unauthorized"
    }).status(401)
    
        const decoded = jwt.verify(token,config.get('jwtPrivateKey'))
        const vendor = decoded;
        req.getConnection((err,conn)=>{
            if(err) return res.send({success: false,status: 500,message: err}).status(500)
               conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[vendor.seller_id],(err,foundVendor)=>{
                  if(err) {return res.send({success: false,status: 400,message: err }).status(400)}
                    else if(foundVendor.length == 0) {return res.send({success: false,status: 404,message: "Vendor not found "}).status(404)}
                    else if(foundVendor.length > 0){
                    return res.send({
                    success: true,status: 200, message:"authorized",sellerId: foundVendor[0].seller_id, sellerName: foundVendor[0].seller_name,
                    seller_email: foundVendor[0].seller_email,seller_contact: foundVendor[0].seller_contact_phone,seller_watsapp: foundVendor[0].seller_watsapp_phone,
                    country: foundVendor[0].seller_country,district: foundVendor[0].seller_district, sector: foundVendor[0].seller_sector,
                    town: foundVendor[0].seller_town, accountStatus: foundVendor[0].account_status, bussiness_description: foundVendor[0].bussiness_description,
                    logo: foundVendor[0].sellerLogo
                  })
                }
            })
        })
  })  
module.exports = router