const express  = require('express')
const router = express.Router();
const { validateEmailVerBody,validateEmailCode } = require('../utils/validators/emailVerification.validator')
const { getEmailVerCode } = require('../utils/uniqueIds/emailVerificationCode')
const authMiddleWare = require('../middlewares/auth');
const {pool} = require('../models/db');


router.post('/verify', [authMiddleWare],(req, res) => {
    const {
        error
    } = validateEmailVerBody(req.body)
    if (error)  return res.send({success: false, status: 400, message: error.details[0].message}).status(400)
    const data = {
        user_id: req.body.userId,
        email: req.body.email,
        code: getEmailVerCode(),
        status: 0
    }

    pool.getConnection((err, conn) => {
        if (err) {
            return res.send({
                success: false,
                status: 500,
                message: err
            }).status(500)
        }

        conn.query('SELECT * FROM users  WHERE user_id = ?', data.user_id, (err, foundUser) => {
            if (err) {
                return res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            } else if (foundUser.length == 0) {
                return res.send({
                    success: false,
                    status: 404,
                    message: "User not found"
                }).status(404)
            } else {
                conn.query('SELECT * FROM emailVerifications WHERE  user_id = ? ', [data.user_id], (err, hasEmail) => {
                    if (err) {
                        return res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } else if (hasEmail.length > 0 && hasEmail[0].status == 1) {
                        res.send({
                            success: false,
                            status: 400,
                            message: "user has email already"
                        }).status(400)
                    } else if (hasEmail.length > 0 && hasEmail[0].status == 0) {
                        conn.query('SELECT * FROM emailVerifications WHERE  email = ? AND status = 1', [data.email], (err, emailUsed) => {
                            if (err) {
                                return res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            } else if (emailUsed.length > 0) {
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: "Email was used"
                                }).status(400)
                            } else {
                                conn.query('UPDATE emailVerifications SET code = ? , email = ?  WHERE   user_id = ?', [data.code, data.email, data.user_id],
                                    (err, response) => {
                                        if (err) {
                                            return res.send({
                                                success: false,
                                                status: 400,
                                                message: err
                                            }).status(400)
                                        } else {
                                            res.send({
                                                success: true,
                                                status: 200,
                                                response: response,
                                                message: "Verfication Code Sent to " + data.email
                                            }).status(200)
                                        }
                                    })
                            }
                        })


                    } else if (hasEmail.length == 0) {
                        conn.query('SELECT * FROM emailVerifications WHERE  email = ? AND status = 1', [data.email], (err, emailUsed) => {
                            if (err) {
                                return res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            } else if (emailUsed.length > 0) {
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: "Email was used"
                                }).status(400)
                            } else {
                                conn.query('INSERT INTO emailVerifications SET ?', data, (err, emailSaved) => {
                                    if (err) {
                                        return res.send({
                                            success: false,
                                            status: 400,
                                            message: err
                                        }).status(400)
                                    } else {
                                        res.send({
                                            success: true,
                                            status: 200,
                                            message: "Verfication Code Sent to " + data.email
                                        }).status(200)
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    })
})

router.post('/verifyCode',(req,res)=>{
    const data = req.body;
    const { error } = validateEmailCode(data)
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400)

    pool.getConnection((err,conn)=>{
        if (err) {
            return res.send({
                success: false,
                status: 500,
                message: err
            }).status(500)
        }
        else{
            conn.query('SELECT * FROM users  WHERE user_id = ?',[data.userId], (err, foundUser) => {
                if (err) {
                    return res.send({
                        success: false,
                        status: 400,
                        message: err
                    }).status(400)
                } else if (foundUser.length == 0) {
                    return res.send({
                        success: false,
                        status: 404,
                        message: "User not found"
                    }).status(404)
                }
                else{
                    conn.query('SELECT * FROM emailVerifications WHERE user_id = ?',[data.userId],(err,response)=>{
                        console.log(response.length +"  "+response[0].status )
                        if (err) {
                            return res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else if(response.length == 0){
                          res.send({
                              success: false,
                              status: 404,
                              message: "No email found"
                          }).status(404)
                        }
                        else if(response.length > 0 && response[0].status == 1){
                          
                           return  res.send({
                                success: false,
                                status: 400,
                                message: "Email already verified"
                            }).status(400)
                        }
                        else if(response.length > 0 && response[0].code != data.code){
                            res.send({
                                success: false,
                                status: 400,
                                message: "Incorrect Email Verification Code"
                            }).status(400)
                        }
                        else if(response.length > 0 && response[0].code == data.code){
                            conn.query('UPDATE emailVerifications SET status = 1 WHERE user_id = ?',[data.userId],(err,respo)=>{
                                if (err) {
                                    return res.send({
                                        success: false,
                                        status: 400,
                                        message: err
                                    }).status(400)
                                }
                                else{
                                    conn.query('UPDATE users SET email = ? WHERE user_id = ?',[response[0].email,data.userId],(err,updatedEmail)=>{
                                        if (err) {
                                            return res.send({
                                                success: false,
                                                status: 400,
                                                message: err
                                            }).status(400)
                                        }
                                        else{
                                            res.send({
                                                success: true,
                                                status: 200,
                                                message: "Email verified"
                                            }).status(200)
                                        }
                                    })
                                 }    
                            })
                        }
                    })
                }
            })
        } 
    })

})

router.put('/updateEmail',[authMiddleWare],(req,res)=>{
 const data = {
    user: req.body.userId,
    email: req.body.email,
    code: getEmailVerCode(),
}
 const {error} = validateEmailVerBody(req.body)
 if(error){ return res.send({success: false,status: 400, message: error.details[0].message}).status(400)}
 pool.getConnection((err,conn)=>{
     if(err){return res.send({success: false, status: 500, message: err}).status(500)}
     conn.query('SELECT*FROM users WHERE user_id = ? ',[data.user],(err,isUserFound)=>{
         if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
         else if(isUserFound.length == 0){
             return res.send({ success: false, status: 404, message: "User not found"}).status(404)
         }
         else if(isUserFound.length == 1 && isUserFound[0].email == "NULL"){
             res.send({success: false, status: 400, message: "User has no email"}).status(400)
         }
         else if(isUserFound.length == 1 && isUserFound[0].email != "NULL"){
           conn.query('SELECT * FROM users  WHERE email = ? AND user_id != ?',[data.email,data.user],(err,isEmailUsed)=>{
               if(err){return res.send({success: false, status: 400, message: err}).status(400)}
               else if(isEmailUsed.length > 0 ){
                   res.send({success: false, status: 400, message: "Email is being used by another person"}).status(400)
               }
               else{
                   conn.query("SELECT * FROM users WHERE user_id = ?  AND email != 'NULL' ",[data.user],(err,hasEmail)=>{
                   if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
                   else if(hasEmail.length == 0){
                       res.send({success: false, status: 400, message: "You need to have email first"}).status(400)
                   }
                   else if(hasEmail.length == 1){
                        conn.query('UPDATE emailVerifications SET status = 0, code = ?,email = ? WHERE user_id = ?',[data.code,data.email,data.user],(err,statusUpdated)=>{
                        if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                        else{
                            res.send({success: true, status: 200, message: "Email verification code set to "+data.email}).status(200)
                        }
                        })
                   }
                   else{
                       res.send({success: false, status: 400, message: "error occured! try again"}).status(400)
                   }
                   })
               }
           })
         }
     })
 })   
})
module.exports = router;