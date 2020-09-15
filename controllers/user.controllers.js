const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {jwtSignUser} = require('../utils/jwt/jwtUserSigner');
const {validateRegistationUserData,validateLoginUserData,updateUserValidator,updateUserProfile
,updateUserPassword} = require('../utils/validators/user.validator');
const hashPassword = require('../utils/hashes/hash_password/hash_password');
const {UserUniqueId} = require('../utils/uniqueIds/userUniqueId');
const router = express.Router();
const adminMiddleWare = require('../middlewares/admin');
const authMiddleWare = require('../middlewares/auth')


router.post('/register',async(req,res)=>{
   
    const data = req.body;
    const {error} = validateRegistationUserData(data);
    if(error){
      return res.send(error.details[0].message).status(400);
    }

    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM users WHERE phone = ?',req.body.phone,async(err,user)=>{
            console.log(user.length)
           
            if(user.length > 0){
                return res.send({
                    message:"Another user with Phone "+req.body.phone+" exists",
                    success: false,
                    status: 400
                }).status(400)
            }
            else{
                const date = new Date();
                    let year = date.getFullYear();
                    let month = date.getMonth()+1;
                    let dayDate = date.getDate(); 
                
                  
                    var createdDate = year+"-"+month+"-"+dayDate;
                    var hashedPass = await hashPassword(req.body.password);
                    const userData = {
                        user_id:UserUniqueId(),
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: hashedPass,
                        phone: req.body.phone,
                        level: 0,
                        created_date: createdDate

                    }
                req.getConnection((err,conn)=>{
                    conn.query('INSERT INTO users set ?', [userData],(err,user)=>{
                        if(err){
                            res.send({
                                success: false,
                                message: err,
                                status: 403
                            }).status(400);
                        }
                       res.status(201).send({success:true});
                    })
                })
            }
        })
    })

   
})

router.post('/login',async(req,res)=>{
    const {error} = validateLoginUserData(req.body);
    if(error){
        res.send(error.details[0].message);
    }
    else{
        req.getConnection((err,conn)=>{
            conn.query('SELECT*FROM users WHERE phone = ?',[req.body.phone],async(err,user)=>{
               if(err){
                    res.send({
                        success: false,
                        status: 400
                    }).status(400);
                }
                else{
                    var affectedRow = user.length;
                    if(affectedRow==0){
                        res.send({message:"user not registered",success:false,status:404}).status(404);
                    }
                    else{
                       const validPassword = await bcrypt.compare(req.body.password,user[0].password);
                       if(!validPassword){
                           return res.send({message:"invalid password",success:false,status:404}).status(404)
                       }
                       else{
                        var token = jwtSignUser(_.pick(user[0],['user_id','firstname','lastname','email','phone','level']))
                        return res.send({
                            user_id:user[0].user_id,
                            firstname:user[0].firstname,
                            lastname:user[0].lastname,
                            email:user[0].email,
                            phone:user[0].phone,
                            level:user[0].level,
                            success: true,
                            status: 200,
                            token:token
                        }).status(200)
    
                       }
                       
                    }
                }
               
    
                
            })
             
        })
    }
    
})


router.get('/allUsers',(req,res)=>{
    let usersArr=[]
    req.getConnection((err,conn)=>{
        conn.query('SELECT*FROM users',(err,users)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            }
            else{
                 for(var i=0;i<users.length;i++){
                     usersArr.push({
                         userId: users[i].user_id,
                         firstname: users[i].firstname,
                         lastname: users[i].lastname,
                         email: users[i].email,
                         phone: users[i].phone,
                         level: users[i].level,
                         created: users[i].created_date

                     })
                 }
                 res.send({
                     success: true,
                     status: 200,
                     users: usersArr
                 }).status(200)
            }
        })
    })
})

router.put('/updateUser/:id',[adminMiddleWare],(req,res)=>{
    
    const data=req.body
    // const {error} = updateUserValidator(data);
    // if(error){
    //     return res.send({
    //         success: false,
    //         status: 400,
    //         message: error.details[i].message
    //     }).status(400)
    // }

    if(data.level != 0 && data.level != 1 && data.level !=2){
        return res.send({
            success: false,
            message: "Level "+data.level+" not arrowed",
            status: 400
        }).status(400)
    }
    req.getConnection((err,conn)=>{
        conn.query('SELECT*FROM users WHERE user_id = ?',req.params.id,(err,user)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            }
            else{
                if(user.length == 0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "user not found"
                    })
                }
                else{
                    conn.query('UPDATE users SET ? WHERE user_id = ?',[data,req.params.id],(err,user)=>{
                        if(err){
                            res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else{
                            res.send({
                                success: true,
                                status: 200,
                                user: user
                            }).status(200)
                        }
                    })
                }
            }
        })
    })
})

router.delete('/removeUser/:id',[adminMiddleWare],(req,res)=>{
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM users WHERE user_id = ?',req.params.id,(err,foundUser)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            }
            else{
                if(foundUser.length== 0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "user not found"
                    }).status(404)
                }
                else{
                    conn.query('DELETE FROM users WHERE user_id = ?',req.params.id,(err,removedUser)=>{
                        if(err){
                            res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else{
                            res.send({
                                success: true,
                                status: 200,
                                message: removedUser
                            }).status(200)
                        }
                    })
                }
            }
        })

    })
})
router.put('/updateProfile',[authMiddleWare],(req,res)=>{
    const data = req.body
    const {error} = updateUserProfile(data)
    if(error){ return res.send({success: false,status: 400, message: error.details[0].message}).status(400) }
    req.getConnection((err,conn)=>{
        if(err){return res.send({success: false, status: 500,message: err}).status(500)}
        else{
          conn.query('SELECT * FROM users WHERE user_id = ?',[data.userId],(err,userIsFound)=>{
              if(err){return res.send({success: false, status: 400, message: err}).status(400)}
              else if(userIsFound.length == 0){
                  return res.send({success: false,status: 404, message: "User not found"})
              }
              else  if(userIsFound.length == 1){
                  conn.query('SELECT * FROM users WHERE phone = ? AND user_id != ?',[data.phone,data.userId],(err,isPhoneUsed)=>{
                      if(err){return res.send({success: false,status: 400, message: err}).status(400)}
                      else if(isPhoneUsed.length > 0){
                          res.send({success: false, status: 400, message: "Phone is being used by Another Person, Use another"}).status(400)
                      }
                      else if(isPhoneUsed.length == 0){
                        conn.query('UPDATE users SET firstname = ?, lastname = ?, phone = ? WHERE user_id  = ?',
                        [data.firstname,data.lastname,data.phone,data.userId],(err,isUpdatae)=>{
                            if(err){return res.send({success: false, status: 400, message: err}).status(40)}
                            else{
                                res.send({success: true, status: 200, message: isUpdatae}).status(200)
                            }
                        })
                      }
                  })
                }
           })
        }
    })
})

router.put('/updatePassword',[authMiddleWare],async(req,res)=>{
    const data = req.body;
    const {error} = updateUserPassword(data)
    if(error) return res.send({success: false, status: 200, message: error.details[0].message}).status(200)
    req.getConnection((err,conn)=>{
        if(err) return res.send({success: false,status: 500, message: err}).status(500)
        conn.query('SELECT * FROM users WHERE user_id = ?',[data.userId],async(err,isUserFound)=>{
            if(err) return res.send({success: false, status: 400, message: err}).status(400)
            else if(isUserFound.length == 0){
                return res.send({success: false,status: 404, message: "User not found"}).status(404)
            }
            else if(isUserFound.length == 1){
                const isPasswordValid = await bcrypt.compare(data.oldPassword,isUserFound[0].password);
                if(!isPasswordValid){
                    return res.send({success: false, status: 401,message: "Invalid Old Password"}).status(401)
                }
                else if(isPasswordValid){
                    const newPassword = await hashPassword(data.newPassword);
                    conn.query('UPDATE users SET password = ?  WHERE user_id = ?',[newPassword,data.userId],async(err,isPasswordUpdated)=>{
                        if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                        else{
                            res.send({success: true, status: 200, message: "Password Changed"}).status(200)
                        }
                    })
                }
            }
        })
    })
})
module.exports=router;