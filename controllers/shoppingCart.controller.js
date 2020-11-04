const express = require('express')
const router  = express.Router();
const {validateData} = require('../utils/validators/productToCart.validator')
const authMiddleWare = require('../middlewares/auth');
const {pool} = require('../models/db');


router.post('/addProduct',[authMiddleWare],(req,res)=>{
    const {error} = validateData(req.body)
                        if(error){
                            return res.send({
                                success: false,
                                status: 400,
                                message: error.details[0].message
                            }).status(400)
                        }
    const data = req.body;
    pool.getConnection((error,conn)=>{
        if(error){
            res.send({
                success: false,
                status: 500,
                message: error
            }).status(500)
        }
        else{
            conn.query('SELECT * FROM users WHERE user_id = ?',[data.customer],(err,foundUser)=>{
                console.log(foundUser.length)
                if(err){
                    res.send({
                        success: false,
                        status: 400,
                        message: err
                    }).status(400)
                }
                else if(foundUser.length==0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "User not found"
                    }).status(404)   
                }
                else{
                    conn.query('SELECT * FROM products WHERE product_id = ?',data.product,(err,foundProduct)=>{
                        if(err){
                            res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else if(foundProduct.length == 0){
                            res.send({
                                success: false,
                                status: 404,
                                message: "Product not found"
                            }).status(404)
                        }
                        else{
                            conn.query('SELECT * FROM shoppingCart WHERE product = ? AND customer = ?',
                            [data.product,data.customer],(err,productCarted)=>{
                                if(err){
                                    res.send({
                                        success: false,
                                        status: 400,
                                        message: err
                                    }).status(400)   
                                }
                                else if(productCarted.length > 0){
                                    res.send({
                                        success: false,
                                        status: 208,
                                        message: "Product already in cart"
                                    }).status(208)
                                }
                                else{
                                    conn.query('INSERT INTO shoppingCart SET ?',data,(err,response)=>{
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
                                                status: 201,
                                                message: response
                                            }).status(201)
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

router.get('/customerCart/:customerId',(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err){
            res.send({
                success: false,
                status: 500,
                message: err
            }).status(500)
        }
        else{
          conn.query('SELECT * FROM users WHERE user_id = ?',[req.params.customerId],(err,foundUser)=>{
              if(err){
                  res.send({
                      success: false,
                      status: 400,
                      message: err
                  }).status(40)
              }
              else if(foundUser.length == 0){
                  res.send({
                      success: false,
                      status: 404,
                      message: "Customer not found"
                  }).status(404)
              }
              else{
                  conn.query('SELECT * FROM shoppingCart WHERE customer = ? ORDER BY cart_id DESC',[req.params.customerId],(err,customer)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } 
                    else if(customer.length == 0){
                          res.send({
                              success: true,
                              status: 200,
                              cartSize: 0
                          }).status(200)
                      }
                      else{
                          res.send({
                              success: true,
                              status: 200,
                              cartSize: customer.length,
                              cart: customer
                          }).status(200)
                      }
                  })
              }
          })
        }
    })
})

router.put('/updateQuantity',[authMiddleWare],(req,res)=>{
   if(req.body.quantity < 1){
      return  res.send({
           success: false,
           status: 403,
           message: "Minimum quantity is 1"
       }).status(403)
   } 
  pool.getConnection((err,conn)=>{
      if(err){
          res.send({
              success: false,
              status: 500,
              message: err
          }).status(500)
      }
      else{
          conn.query('SELECT * FROM users WHERE user_id = ?',[req.body.customer],(err,foundUser)=>{
           if(err){
                  res.send({
                      success: false,
                      status: 400,
                      message: err
                  }).status(400)
              }
              else if(foundUser.length == 0){
                  res.send({
                      success: false,
                      status: 404,
                      message: "Customer not found"
                  }).status(404)
              }
              else{
                  conn.query('SELECT * FROM products WHERE product_id = ?',[req.body.product],(err,foundProduct)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    }
                    else if(foundProduct.length == 0){
                        res.send({
                            success: false,
                            status: 404,
                            message: "Product not found"
                        }).status(404)
                    }
                    else{
                        conn.query('SELECT * FROM shoppingCart WHERE customer = ?',[req.body.customer],(err,foundCart)=>{
                            if(err){
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            }
                            else if(foundCart.length == 0){
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: "Customer's cart is Empty"
                                }).status(400)
                              }
                              else{
                                conn.query('SELECT * FROM  shoppingCart WHERE product = ?',[req.body.product],(err,productInCart)=>{
                                  if(err){
                                    res.send({
                                        success: false,
                                        status: 400,
                                        message: err
                                    }).status(400)
                                  }
                                  else if(productInCart.length == 0){
                                    res.send({
                                        success: false,
                                        status: 400,
                                        message: "Product Missing In Cart"
                                    }).status(400)
                                  }
                                  else{
                                      conn.query('SELECT * FROM shoppingCart WHERE product = ? AND customer = ?',[req.body.product,req.body.customer],(err,productCustCart)=>{
                                        if(err){
                                            res.send({
                                                success: false,
                                                status: 400,
                                                message: err
                                            }).status(400)
                                          }
                                          else if(productCustCart.length == 0){
                                            res.send({
                                                success: false,
                                                status: 400,
                                                message: "Product Missing In Customer's Cart"
                                            }).status(400)
                                          }
                                          else{
                                              
                                            conn.query('UPDATE shoppingCart SET quantity = ? WHERE product = ? AND customer = ?',
                                            [req.body.quantity,req.body.product,req.body.customer],(err,updatedProduct)=>{
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
                                                        message: updatedProduct
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
             
              }
          })
      }
  })
})



router.delete('/removeFormCart/:customer/:product',(req,res)=>{
   
   pool.getConnection((err,conn)=>{
       if(err){
           res.send({
               success: false,
               status: 500,
               message: err
           }).status(500)
       }
       else{
           conn.query('SELECT * FROM users WHERE user_id = ?',[req.params.customer],(err,foundUser)=>{
            if(err){
                   res.send({
                       success: false,
                       status: 400,
                       message: err
                   }).status(400)
               }
               else if(foundUser.length == 0){
                   res.send({
                       success: false,
                       status: 404,
                       message: "Customer not found"
                   }).status(404)
               }
               else{
                   conn.query('SELECT * FROM products WHERE product_id = ?',[req.params.product],(err,foundProduct)=>{
                     if(err){
                         res.send({
                             success: false,
                             status: 400,
                             message: err
                         }).status(400)
                     }
                     else if(foundProduct.length == 0){
                         res.send({
                             success: false,
                             status: 404,
                             message: "Product not found"
                         }).status(404)
                     }
                     else{
                         conn.query('SELECT * FROM shoppingCart WHERE customer = ?',[req.params.customer],(err,foundCart)=>{
                             if(err){
                                 res.send({
                                     success: false,
                                     status: 400,
                                     message: err
                                 }).status(400)
                             }
                             else if(foundCart.length == 0){
                                 res.send({
                                     success: false,
                                     status: 400,
                                     message: "Customer's cart is Empty"
                                 }).status(400)
                               }
                               else{
                                 conn.query('SELECT * FROM  shoppingCart WHERE product = ?',[req.params.product],(err,productInCart)=>{
                                   if(err){
                                     res.send({
                                         success: false,
                                         status: 400,
                                         message: err
                                     }).status(400)
                                   }
                                   else if(productInCart.length == 0){
                                     res.send({
                                         success: false,
                                         status: 400,
                                         message: "Product Missing In Cart"
                                     }).status(400)
                                   }
                                   else{
                                       conn.query('SELECT * FROM shoppingCart WHERE product = ? AND customer = ?',[req.params.product,req.params.customer],(err,productCustCart)=>{
                                         if(err){
                                             res.send({
                                                 success: false,
                                                 status: 400,
                                                 message: err
                                             }).status(400)
                                           }
                                           else if(productCustCart.length == 0){
                                             res.send({
                                                 success: false,
                                                 status: 400,
                                                 message: "Product Missing In Customer's Cart"
                                             }).status(400)
                                           }
                                           else{
                                               
                                             conn.query('DELETE FROM  shoppingCart  WHERE product = ? AND customer = ?',
                                             [req.params.product,req.params.customer],(err,removedProduct)=>{
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
                                                         message: removedProduct
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
              
               }
           })
       }
   })
 })
 
module.exports = router;