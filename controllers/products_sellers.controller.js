//-------------foreign key not yet checked befor action
const express = require('express');
const {validateSeller,validateSellerPassword,validateResendEmailVeriCode} = require('../utils/validators/productsSellers.validator')
const { validateLoginUserData } = require('../utils/validators/user.validator')
const {SellerUniqueId} = require('../utils/uniqueIds/sellerUniqueId')
const adminMiddleWare = require('../middlewares/admin');
const authMiddleWare = require('../middlewares/auth')
const hashPassword = require('../utils/hashes/hash_password/hash_password');
const { getEmailVerCode } = require('../utils/uniqueIds/emailVerificationCode')
const {jwtSignUser} = require('../utils/jwt/jwtUserSigner');
const _ = require('lodash')
const {ImageUniqueName } = require('../utils/uniqueIds/imageUniqueName')
const multer = require('multer');
const bcrypt = require('bcrypt')

const router = express.Router();
const {pool} = require('../models/db');


router.post('/newSeller',(req,res)=>{
    console.log(req.body)
    const data = req.body;
    const {error} =  validateSeller(data);
    if(error) return res.send(error.details[0].message).status(403);
    const sellerData = {
        seller_id : SellerUniqueId(), 
        seller_name : req.body.seller_name,
        seller_watsapp_phone : req.body.seller_watsapp_phone,
        seller_contact_phone : req.body.seller_contact_phone,
        seller_country : req.body.seller_country,
        seller_district : req.body.seller_district,
        seller_sector : req.body.seller_sector,
        seller_email : req.body.seller_email,
        seller_town : req.body.seller_town,
        account_status: 0,
        emailVerificationCode: getEmailVerCode(),
        bussiness_description: req.body.bussiness_description
}

pool.getConnection((err,conn)=>{
    if(err){return res.send({success: false, status: 500,  message: err}).status(500)}
    else{
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[sellerData.seller_id],(err,isIdUsed)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(isIdUsed.length> 0){
                return res.send({success: false, status: 500, message: "Error occured Please try again leter."})
                .status(500)
            }
            else{
                conn.query('SELECT*FROM productsSellers WHERE seller_contact_phone = ? AND account_status = 2',[sellerData.seller_contact_phone]
                ,(err,isPhoneUsed)=>{
                    if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                    else if(isPhoneUsed.length > 0){
                        res.send({success: false, statu: 400, message: "Onother user with contact: "+data.seller_contact_phone+" exists, use another phone"})
                        .status(400)
                    }
                    else{
                        conn.query('SELECT * FROM productsSellers WHERE seller_email = ? AND account_status = 2',[data.seller_email],(err, isEmailUsed)=>{
                            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                            else if(isEmailUsed.length > 0){
                                res.send({success: false, status: 400, message:"Email: "+data.seller_email+" was used, Use another"})
                                .status(400)
                            }
                            else{
                                conn.query('INSERT INTO productsSellers SET ?',[sellerData],(err,conn)=>{
                                    if(err){ return res.send({success: false,status: 400, message: err}).status(400)}
                                    else{
                                        res.send({success: true, status: 200, email: sellerData.seller_email,message: "Verify email to activate account",
                                        sellerId: sellerData.seller_id})
                                        .status(200)
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

router.post('/addSellerPassoword',async(req,res)=>{
    const {error} = validateSellerPassword(req.body)
    if(error){ return res.send({success: false, status:400, message: error.details[0].message}).status(400)}
    var hashedPass = await hashPassword(req.body.password);
    // var hashedPass = req.body.password
    
    pool.getConnection((err,conn)=>{
        if(err){return res.send({success: false, status: 500, message: err}).status(500)}
        conn.query('SELECT*FROM productsSellers WHERE seller_id = ?',[req.body.sellerId],(err,isSeller)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(isSeller.length == 0){
                res.send({success: false, status: 404, message: "Seller not found"}).status(404)
            }
            else if(isSeller.length==1){
             conn.query('UPDATE productsSellers SET password = ?, account_status = 2 WHERE seller_id = ?',[hashedPass,req.body.sellerId],(err,updatedPass)=>{
                 if(err){return re.send({success: false, status: 400, message: err}).status(400)}
                 else{
                     conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[req.body.sellerId],(err,gotSeller)=>{
                         if(err){ return res.send({success: false, status: 400, message: err}).satus(400)}
                         else if(gotSeller.length == 1){
                               res.send({success: true, status: 200, message: updatedPass, sellerPhone: gotSeller[0].seller_contact_phone})
                               .status(200)
                         }
                         else{
                             res.send({success: false, status: 400, message: "An error Occured"}).status(400)
                         }
                     })
                   
                 }
             })
            }
            else{
                res.send({success: false, status: 400, message: "Error occured, try again"}).status(400)
           }
        })
    })
})


//-------------------------------------multer uploading the seller logo----------------------------------------
//-------------------------- DECLAIRING THE LOGO STORAGE----------------------
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'utils/uploads/vendorsLogos')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${ImageUniqueName()}-${file.originalname.toLowerCase()}`)
    }
})
const upload = multer({
    storage: storage
})
//----------------------------END OF DECLAIRING THE IMAGE STORAGE------------------------

//----------------------------PROCESSING THE REQUEST-------------------------------------
router.post('/addSellerLogo', upload.single('file'), (req, res, next) => {
    const file = req.file;
    const sellerId = req.header('seller-id')

    // console.log(file.filename);
    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error)
    }
    
    pool.getConnection((err,conn)=>{
        if(err){return res.send({success: false, status: 500, message: err})}
        conn.query('SELECT*FROM productsSellers WHERE seller_id = ?',[sellerId],(err,isSeller)=>{
            if(err){return re.send({success: false, status: 400, message: err}).status(400)}
            else if(isSeller.length == 0){
                res.send({success: false, status: 404, message: "Seller not found"}).status(404)
            }
            else if(isSeller.length == 1){
              conn.query('UPDATE productsSellers SET sellerLogo = ? WHERE seller_id = ?',[file.filename,sellerId],
              (err,updatedLogo)=>{
                  if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
                  else {
                      res.send({success: true, status: 200, message: updatedLogo}).status(200)
                  }
              })
            }
            else{
                return re.send({success: false, status: 400, message: "error occured try again"}).status(400)
            }
        })
    })

})

router.post('/activateSellerAccount',(req,res)=>{
    const data = req.body;
    pool.getConnection((err,conn)=>{
        if(err){
            return  res.send({success: false, status: 500, message: err}).status(500)
        }
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[data.seller_id],(err,hasAccount)=>{
            if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
            if(hasAccount.length == 0){
                res.send({success: false, status: 404, message: "Account not found"}).status(404)
            }
            else if(hasAccount.length == 1 && hasAccount[0].account_status == 1){
                res.send({success: false, status: 400, message: "Account aready Activated."}).status(400)
            }
            else if(hasAccount.length == 1 && hasAccount[0].account_status == 0){
                if(data.verificationCode != hasAccount[0].emailVerificationCode){
                    res.send({success: false, status: 400, message: "Invalid Verification code"}).status(400)
                }
                else if(data.verificationCode == hasAccount[0].emailVerificationCode){
                  conn.query('UPDATE productsSellers SET account_status = 1 WHERE seller_id=?',[data.seller_id],
                  (err,accountActivated)=>{
                      if(err){return res.send({success: false, status: 400, message:err}).status(400)}
                      else{
                          res.send({success: true, status: 200, message: "Acccount activated successfully"})
                      }
                  })
                }
            }
        })
    })
})

router.post('/vendor/login',async(req,res)=>{
  const body = req.body;  
  const {error} = validateLoginUserData(body)
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(500)
    pool.getConnection((err,conn)=>{
        if(err) return res.send({success: false, status: 500, message: err}).status(500)
        conn.query('SELECT*FROM productsSellers WHERE seller_contact_phone = ?',[body.phone],async(err,isSeller)=>{
            console.log(isSeller.length)
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(isSeller.length == 0){
                res.send({success: false, status: 401, message: "Invalid Phone or Password"}).status(401)
            }
            else if(isSeller.length == 1 && isSeller[0].account_status < 2 ){
                res.send({success: false, status: 423 , message:"Account not activated, click 'Create a Seller Account' to create new account."}).status(423)
            }
            else if(isSeller.length == 1 &&( isSeller[0].account_status == 2 ||  isSeller[0].account_status == 3)){
               const validPass = await bcrypt.compare(body.password,isSeller[0].password)
               if(!validPass){
                   return res.send({success: false, status: 401, message: "Invalid Phone or Password"}).status(401)
               }
               else{
                var token = jwtSignUser(_.pick(isSeller[0],['seller_id','seller_name','seller_contact_phone',
                'seller_watsapp_phone','seller_country','seller_district','seller_sector','seller_town','seller_email',
                'account_status']))
                return res.send({success: true, status: 200, token: token}).status(200)

               }
            }
            else{
                res.send({success: false, status: 400, message: "Error occured"}).status(400)
            }
        })
    })
})

router.post('/resendVerificationCode',(req,res)=>{
    const {error} = validateResendEmailVeriCode(req.body);
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400) 
    const vendorId = req.body.sellerId;
    if(!vendorId) return res.send({success: false, status: 400, message: 'vendor-id header not found'});
    const code = getEmailVerCode();
    pool.getConnection((err,conn)=>{
       if(err){ return res.send({success: false, status: 500, message: err})} 
       conn.query('SELECT*FROM productsSellers WHERE seller_id = ?', [vendorId],(err,isVendor)=>{
           if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
           else if(isVendor.length == 0){
               return res.send({success: false, status: 404, message: "Seller not found"}).status(404)
           }
           else if(isVendor.length == 1){
             conn.query('UPDATE productsSellers SET emailVerificationCode = ? WHERE seller_id = ?',[code,vendorId],(err,codeResent)=>{
                 if(err){  return res.send({success: false, status: 400, message: err}).status(400)}
                 else{
                     res.send({ success: true, status: 200, sellerEmail: isVendor[0].seller_email}).status(200)
                 }
             })
           }
           else{
               res.send({success: false, status: 400, message: "Error occured try again!"}).status(400)
           }
       })
})
})
router.get('/sellers',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsSellers',(err,sellers)=>{
            if(err){
                res.send({error: err,success:false,status:400}).status(400);
            }
            else{
                res.send({
                    success: true,
                    status: 200,
                    sellers: sellers
                }).status(200)
            }
        })
    })
})

router.get('/:id',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',req.params.id,(err,seller)=>{
            if(err){
                res.send({
                    error: err,
                    success: false,
                    status: 400
                }).status(400)
            }
           else if(seller.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "seller not found"
                }).status(404)
            }
             else{
                res.send({
                    success: true,
                    status: 200,
                    seller: seller
                })
           }
     })
    })
})

router.put('/updateSeller/:id',[authMiddleWare],(req,res)=>{
   console.log("in>>>")
    const {error} = validateSeller(req.body);
    if(error) return res.send({success: false, status: 403, error: error.details[0].message }).status(403)
    const sellerId = req.params.id; 
    console.log("Seller id"+sellerId);
    const newSeller = req.body;
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[sellerId],(err,seller)=>{
          if(err){return res.send({success:false, status: 400, message: err}).status(400)}  
          if(seller.length == 0){
              return res.send({success: false, message: "seller not found",status: 404}).status(404)
         }
          else{
            conn.query('SELECT*FROM productsSellers WHERE seller_contact_phone = ? AND seller_id != ? AND account_status = 2',
            [req.body.seller_contact_phone, req.params.id],(err,isContactUsed)=>{
                if(err){return res.send({success:false, status: 400, message: err}).status(400)}  
                else if(isContactUsed.length > 0){
                    res.send({success: false, status: 400, message: "There is another user with phone "+req.body.seller_contact_phone})
                    .status(400);
                }
                else if(isContactUsed.length == 0){
                    conn.query('SELECT * FROM productsSellers WHERE seller_email = ? AND seller_id != ? AND account_status =2',
                    [req.body.seller_email,req.params.id],(err,isEmailUsed)=>{
                        if(err){return res.send({success: false, status:  400, message: err}).status(400)}
                        else if(isEmailUsed.length > 0){
                            res.send({success: false, status: 400, message: "There is another user with Email"+req.body.seller_email})
                            .status(400);
                        }
                        else if(isEmailUsed.length == 0){
                            conn.query('UPDATE productsSellers SET ? WHERE seller_id = ?',[newSeller,sellerId],(err,updatedSeller)=>{
                                if(err){res.send({success:false, status: 400, error: err}).status(400)
                              }
                                else{res.send({ success: true,  status: 200,updatedSeller: updatedSeller}).status(200)
                              }
                            })
                        }
                        else{
                        return res.send({success: false, status:  400, message: "error occured"}).status(400)
                            
                        }
                    })
                   
                }
            })  
           
          }
        })
    })
})

router.delete('/removeSeller/:id',[adminMiddleWare],(req,res)=>{
    
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',req.params.id,(err,seller)=>{
            if(seller.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "seller not found"
                }).status(404)
            }
            else{
                conn.query('DELETE FROM products WHERE prod_seller = ?',req.params.id,(err,deletedSeller)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    }
                    else{
                        conn.query('DELETE FROM productsSellers WHERE seller_id = ?',req.params.id,(err,removedSeller)=>{

                            if(err){
                                res.send({
                                    success: false,
                                    status: 400,
                                    error: err
                                }).status(400)
                            }
                            else{
                                res.send({
                                    success: true,
                                    status: 200,
                                    removedSeller: removedSeller
                                }).status(200)
                            }
                        })
                    }
                })
              
            }
        })

       
    })
})

router.get('/sellerInfo/:sellerId',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[req.params.sellerId],(err,seller)=>{
            if(err){
                res.send({error: err,success: false,status: 400}).status(400)
            }
           else if(seller.length == 0){
                res.send({success: false,status: 404,message: "seller not found"}).status(404)
            }
             else{
                 res.send({success: true,status: 200,
                    info: _.pick(seller[0],[
                        'seller_name',
                        'seller_watsapp_phone',
                        'seller_contact_phone',
                        'seller_country',
                        'seller_district',
                        'seller_sector',
                        'seller_email',
                        'seller_town',
                        'sellerLogo'
                    ])
                })
           }
     })
    })
})
module.exports=router;