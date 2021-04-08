const express = require('express');
const {validateAddress } = require('../utils/validators/usesAddress.validator')
const router = express.Router();
const authMiddleWare = require('../middlewares/auth');
const {pool} = require('../models/db');


router.post('/addAddress',[authMiddleWare],(req,res)=>{
     const data = req.body;
     const {error} = validateAddress(data)
     if(error) return res.send({success: false,status: 400, message: error.details[0].message}).status(400)
      pool.getConnection((err,conn)=>{
          if(err){
             return  res.send({
                  success: false,
                  status: 500,
                  message: err
              }).status(500)
          }
        conn.query('SELECT* FROM users WHERE user_id = ?',[data.user],(err,foundUser)=>{
            if(err){
                return  res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            }
            else{
                if(foundUser.length ==0 ){
                    res.send({
                        success: false,
                        status: 404,
                        message: "User not found"
                    }).status(404)
                }
                else{
                    conn.query('SELECT * FROM usersAddresses WHERE user  = ?',[data.user],(err,hasAddress)=>{
                        if(err){
                            return  res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else if(hasAddress.length == 1){
                            conn.query('UPDATE usersAddresses SET country = ?, city = ?, streetCode = ? WHERE user = ?',
                            [data.country,data.city,data.streetCode,data.user],(err,userUpdated)=>{
                                if(err){return res.send({success: false,status : 400, message: err}).status(400)}
                                else{
                                    res.send({
                                        success: true,
                                        status: 200,
                                        message: userUpdated
                                    }).status(200)
                                }
                            })
                         }
                         else{
                             conn.query('INSERT INTO usersAddresses SET ?',data,(err,addressCreated)=>{
                                if(err){
                                    return  res.send({
                                        success: false,
                                        status: 400,
                                        message: err
                                    }).status(400)
                                }
                                else{
                                    res.send({
                                        success: true,
                                        status: 200,
                                        message: addressCreated
                                    }).status(200)
                                }   
                             })
                         }
                    })  
                }
            }
        })
      })
})

router.put('/updateAddress',[authMiddleWare],(req,res)=>{
    const data = req.body;
    const {error} = validateAddress(data)
    if(error) return res.send({success: false,status: 400, message: error.details[0].message}).status(400)
    
    pool.getConnection((err,conn)=>{
        if(err){
            return  res.send({
                 success: false,
                 status: 500,
                 message: err
             }).status(500)
         }
         conn.query('SELECT * FROM users WHERE user_id = ?',[data.user],(err,foundUser)=>{
             if(err){
                return  res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
             }
             else if(foundUser.length == 0){
                 return res.send({
                     success: false,
                     status: 404,
                     message: "User not found"
                 }).status(404)
             }
             else{
                 conn.query('SELECT*FROM usersAddresses WHERE user = ?',[data.user],(err,hasAddress)=>{
                    if(err){
                        return  res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                     }
                      else if(hasAddress.length==0){
                       conn.query('INSERT INTO usersAddresses SET country = ?, city = ?, streetCode = ?, user = ?',
                       [data.country,data.city,data.streetCode,data.user],(err,isAddressCreated)=>{
                           if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                           else{
                               res.send({success: true, status: 200, message: "Address saved successfully"}).status(400)
                           }
                       })
                     }
                     else if(hasAddress.length > 0){
                       conn.query('UPDATE usersAddresses SET country = ?, city = ?, streetCode = ? WHERE user = ?',
                       [data.country,data.city,data.streetCode,data.user],(err,addressUpdated)=>{
                        if(err){
                            return  res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                         }
                         else{
                             res.send({
                                 success: true,
                                 status: 200,
                                 message: addressUpdated
                             }).status(200)
                         }  
                       })
                     }
                 })
             }
         })
    })

})

router.get('/userAddress/:user',(req,res)=>{
    const user = req.params.user;
    pool.getConnection((err,conn)=>{
        if(err){
            return  res.send({
                 success: false,
                 status: 500,
                 message: err
             }).status(500)
         }

         conn.query('SELECT*FROM users WHERE user_id = ?',[user],(err,foundUser)=>{
            if(err){
                return  res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
             }
             else if(foundUser.length == 0){
                 res.send({
                     success: false,
                     status: 404,
                     message: "User not found"
                 }).status(404)
             }
             else{
                 conn.query('SELECT*FROM usersAddresses WHERE user = ?',[user],(err,hasAddress)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 404,
                            message: "User not found"
                        }).status(404)
                    }
                    else if(hasAddress.length==0){
                        return res.send({
                            success: false,
                            status: 400,
                            message: "User has no address"
                        }).status(400)
                     }
                     else if(hasAddress.length == 1){
                         res.send({
                             success: true,
                             status: 200,
                             address: hasAddress
                         })
                     }
                 })
             }
         })
    })
})

router.delete('/removeAddress/:user',[authMiddleWare],(req,res)=>{
    const user = req.params.user;
    pool.getConnection((err,conn)=>{
        if(err){
            return  res.send({
                 success: false,
                 status: 500,
                 message: err
             }).status(500)
         }

         conn.query('SELECT*FROM users WHERE user_id = ?',[user],(err,foundUser)=>{
            if(err){
                return  res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
             }
             else if(foundUser.length == 0){
                 res.send({
                     success: false,
                     status: 404,
                     message: "User not found"
                 }).status(404)
             }
             else{
                 conn.query('SELECT*FROM usersAddresses WHERE user = ?',[user],(err,hasAddress)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 404,
                            message: "User not found"
                        }).status(404)
                    }
                    else if(hasAddress.length==0){
                        return res.send({
                            success: false,
                            status: 400,
                            message: "User has no address"
                        }).status(400)
                     }
                     else if(hasAddress.length == 1){
                         conn.query('DELETE FROM usersAddresses WHERE user = ?',[user],(err,addressRemoved)=>{
                            if(err){
                                res.send({
                                    success: false,
                                    status: 404,
                                    message: "User not found"
                                }).status(404)
                            }
                            else{
                                res.send({
                                    success: true,
                                    status: 200,
                                    message:addressRemoved
                                }).status(200)
                            }
                         })
                     }
                 })
             }
         })
    })
})
module.exports = router