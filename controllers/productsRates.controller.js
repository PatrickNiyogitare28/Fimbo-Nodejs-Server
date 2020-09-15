const express = require('express');
const router = express.Router();

router.post('/rate',(req,res)=>{
  const newRate = {
        product: req.body.productId,
        rates: 0
    }
    req.getConnection((err,conn)=>{
        conn.query('SELECT*FROM products WHERE product_id=?',req.body.productId,(err,foundProducts)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err  
                }).status(40)
            }
            else if(foundProducts.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "Products not found"
                }).status(404)
            }
            else{
                conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,rateProduct)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(200)
                    }
                    else if(rateProduct.length == 0){
                        conn.query('INSERT INTO productsRates SET ?',[newRate],(err,newRate)=>{
                            if(err){
                                res.send({
                                    success:false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            }
                            else{
                                conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,foundProduct)=>{
                                    if(err){
                                        res.send({
                                            success: false,
                                            status: 400,
                                            message: err
                                        }).status(400)
                                    }else{
                                        var newRateValue = foundProduct[0].rates + 1;
                                        conn.query('UPDATE productsRates SET rates = ? WHERE product = ?',[newRateValue,req.body.productId]
                                        ,(err,upadatedRate)=>{
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
                                                    message: upadatedRate
                                                }).status(200)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                    else if(rateProduct.length > 0){
                        conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,foundProduct)=>{
                            if(err){
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            }else{
                                var newRateValue = foundProduct[0].rates + 1;
                                conn.query('UPDATE productsRates SET rates = ? WHERE product = ?',[newRateValue,req.body.productId]
                                ,(err,upadatedRate)=>{
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
                                            message: upadatedRate
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

router.get('/rates/:productId',(req,res)=>{
  req.getConnection((err,conn)=>{
    conn.query('SELECT*FROM products WHERE product_id=?',req.params.productId,(err,foundProduct)=>{
        if(err){
            res.send({
                success: false,
                status: 400,
                message: err
            }).status(400)
        }
              else if(foundProduct.length == 0){
              res.send({
                  success:false,
                  status: 404,
                  message:"Products not found"
              }).status(404)
              
        }
        else{
          conn.query('SELECT*FROM productsRates WHERE product = ?',req.params.productId,(err,foundRate)=>{
              if(err){
                  res.send({
                      success: false,
                      status: 400,
                      message: err,
                  }).status(400)
              }
              else if(foundRate.length == 0){
                  res.send({
                      success: true,
                      status: 200,
                      rates: 0
                  }).status(200)
              }
              else{
                 res.send({
                     success: true,
                     status: 200,
                     rates: foundRate[0].rates
                 })   
              }
          })
        }
           
    }) 
  })  
})


router.post('/unrate',(req,res)=>{
    const newRate = {
          product: req.body.productId,
          rates: 0
      }
      req.getConnection((err,conn)=>{
          conn.query('SELECT*FROM products WHERE product_id=?',req.body.productId,(err,foundProducts)=>{
              if(err){
                  res.send({
                      success: false,
                      status: 400,
                      message: err  
                  }).status(40)
              }
              else if(foundProducts.length == 0){
                  res.send({
                      success: false,
                      status: 404,
                      message: "Products not found"
                  }).status(404)
              }
              else{
                  conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,rateProduct)=>{
                      if(err){
                          res.send({
                              success: false,
                              status: 400,
                              message: err
                          }).status(200)
                      }
                      else if(rateProduct.length == 0){
                          conn.query('INSERT INTO productsRates SET ?',[newRate],(err,newRate)=>{
                              if(err){
                                  res.send({
                                      success:false,
                                      status: 400,
                                      message: err
                                  }).status(400)
                              }
                              else{
                                  conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,foundProduct)=>{
                                      if(err){
                                          res.send({
                                              success: false,
                                              status: 400,
                                              message: err
                                          }).status(400)
                                      }else{
                                          console.log("here")
                                          if(foundProduct[0].rates > 0){
                                          var newRateValue = foundProduct[0].rates - 1;
                                          console.log("Unrates: "+newRateValue)
                                          conn.query('UPDATE productsRates SET rates = ? WHERE product = ?',[newRateValue,req.body.productId]
                                          ,(err,upadatedRate)=>{
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
                                                      message: upadatedRate
                                                  }).status(200)
                                              }
                                          })
                                        }
                                        else{
                                            res.send({
                                                success: false,
                                                status: 400,
                                                message:"Product can not be unliked"
                                            }).status(400)
                                        }
                                      }
                                  })
                              }
                          })
                      }
                      else if(rateProduct.length > 0){
                          conn.query('SELECT * FROM productsRates WHERE product = ?',req.body.productId,(err,foundProduct)=>{
                              if(err){
                                  res.send({
                                      success: false,
                                      status: 400,
                                      message: err
                                  }).status(400)
                              }else{
                                console.log("here")
                                if(foundProduct[0].rates > 0){
                                var newRateValue = (foundProduct[0].rates - 1);
                                console.log("Unrates: "+newRateValue)
                                 conn.query('UPDATE productsRates SET rates = ? WHERE product = ?',[newRateValue,req.body.productId]
                                  ,(err,upadatedRate)=>{
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
                                              message: upadatedRate
                                          }).status(200)
                                      }
                                  })
                                }
                                else{
                                    res.send({
                                        success: false,
                                        status: 400,
                                        message: "Prouduct can not be unliked"
                                    }).status(400)  
                                }
                              }
                          })
                      
                      }
                  })
              }
          })
      })
  })
  
module.exports=router;