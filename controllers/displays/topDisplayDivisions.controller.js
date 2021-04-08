const express = require('express');
const router = express.Router();
const adminMiddleWare = require('../../middlewares/admin');
const {pool} = require('../../models/db');

router.get('/set',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM topDisplayDivisions',(err,topDivisions)=>{
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
                    topDivisions: topDivisions
                }).status(200)
            }
        })
    })
})

router.get('/withProducts/:id',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM topDisplayDivisions WHERE division_id = ?',req.params.id,(err,topDivision)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            }
            else{
                if(topDivision.length==0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "Division not found"
                    }).status(404)
                }
                else{
                    conn.query('SELECT * FROM topDivs_productsIn WHERE division = ?',req.params.id,(err,devisionProd)=>{
                        if(err){
                            res.send({
                                success: false,
                                status: 400,
                                message: err
                            })
                        }
                        else if(devisionProd.length==0){
                            res.send({
                                success: true,
                                status: 200,
                                found: devisionProd.length,
                                division_id: topDivision[0].division_id,
                                division_status: topDivision[0].division_status,
                                division_name: topDivision[0].division_name,
                                contents: devisionProd

                                
                            }).status(200)
                        }
                        else if(devisionProd.length > 0){
                            
                            res.send({
                                success: true,
                                status: 200,
                                found: devisionProd.length,
                                division_id: topDivision[0].division_id,
                                division_status: topDivision[0].division_status,
                                division_name: topDivision[0].division_name,
                                contents: devisionProd
                                
                            })
                        }
                    })
                }
              
            }
        })
    })
})

router.post('/set',[adminMiddleWare],(req,res)=>{
    const data= req.body;
    pool.getConnection((err,conn)=>{
      conn.query('SELECT * FROM products WHERE product_id = ?',data.product,(err,foundProduct)=>{
          if(err){
            //   console.log("Error: "+err)
              res.send({
                  success: false,
                  message: err,
                  status: 400
              }).status(400)
            }
            else{
                if(foundProduct.length == 0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "Product not found"
                    }).status(404)
                }
                else{
                    conn.query('SELECT * FROM topDisplayDivisions WHERE division_id = ?',data.division,(err,foundDivision)=>{
                        if(err){
                            res.send({
                                success: false,
                                status: 400,
                                message: err
                            }).status(400)
                        }
                        else{
                            if(foundDivision.length==0){
                                res.send({
                                    success: false,
                                    status: 404,
                                    message: "Division not found"
                                }).status(404)
                            }
                            else{
                                conn.query('SELECT* FROM topDivs_productsIn WHERE division = ?',data.division,(err,divisionExist)=>{
                                   if(err){
                                       res.send({
                                           success: false,
                                           status: 400,
                                           message: err
                                       }).status(400)
                                   }
                                    else if(divisionExist.length > 4){
                                      res.send({
                                          success: false,
                                          status: 400,
                                          message: "Division "+data.division+" is Full"
                                      }).status(400)
                                  }else{
                                      conn.query('SELECT * FROM topDivs_productsIn WHERE product = ? AND division = ?',[data.product,data.division],(err,productExists)=>{
                                          if(err){
                                              res.send({
                                                  success: false,
                                                  status: 400,
                                                  message: err
                                              }).status(400)
                                          }
                                          else if(productExists.length > 0){
                                              res.send({
                                                  success: false,
                                                  status: 400,
                                                  message: "400, Product ("+foundProduct[0].prod_name+") Aready exists in Division "+data.division
                                              }).status(400)
                                          }
                                          else{
                                              conn.query('INSERT INTO topDivs_productsIn SET ?',data,(err,response)=>{
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
                                                          message: '200, Product ('+foundProduct[0].prod_name+') added in Division '+data.division
                                                      })
                                                  }
                                              })
                                          }
                                      })
                                  }
                                })
                            }
                        }
                    })
                }
            }
      })
    })
})


router.delete('/removeProduct/:prodId/:divId',[adminMiddleWare],(req,res)=>{
  
    pool.getConnection((err,conn)=>{
        conn.query("SELECT * FROM topDivs_productsIn WHERE division = ?",req.params.divId,(err,foundDiv)=>{
            if(err){
                res.send({
                    success: false,
                    status: 400,
                    message: err,
                }).status(400)
            }
            else if(foundDiv.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message:" Division not found"
                }).status(404)
            }else{
                conn.query('SELECT * FROM topDivs_productsIn WHERE product = ?',req.params.prodId,(err,foundProd)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err,
                        }).status(400)
                    } else if(foundProd.length == 0){
                        res.send({
                            success: false,
                            status: 404,
                            message:" Product not found"
                        }).status(404)
                    }
                    else{
                        conn.query('SELECT * FROM topDivs_productsIn WHERE division = ? AND product = ?',[req.params.divId,req.params.prodId],(err,pairFound)=>{
                            if(err){
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            }
                            else if(pairFound.length==0){
                                res.send({
                                    success: false,
                                    status: 404,
                                    message: "Combination not found"
                                }).status(404)
                            }
                            else if(pairFound.length > 0){
                                conn.query('DELETE FROM topDivs_productsIn WHERE division = ? AND product = ?',[req.params.divId,req.params.prodId],(err,deleted)=>{
                                    if(err){
                                        res.send({
                                            success: false,
                                            status: 400,
                                            message: err
                                        }).status(400)
                                    }
                                    else{
                                        conn.query('UPDATE topDisplayDivisions SET division_status = 0 WHERE division_id = ?',req.params.divId,(err,statusChanged)=>{
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
                                                    message: "Product removed from Division "+req.params.divId
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
})

router.put('/changeStatus/:divId',[adminMiddleWare],(req,res)=>{
   
    if(req.body.status_id > 1 || req.body.status_id <0){
     
        return res.send({
            success: false,
            status: 404,
            message: "Status not allowed"
        }).status(404)
    }
    else{
        pool.getConnection((err,conn)=>{
            conn.query('SELECT * FROM topDisplayDivisions WHERE division_id = ?',req.params.divId,(err,foundDivision)=>{
                if(err){
                    res.send({
                        success: false,
                        status: 400,
                        message: err
                    }).status(400)
                }
                else if(foundDivision.length == 0){
                    res.send({
                        success: false,
                        status: 404,
                        message: "Division not found"
                    }).status(404)
                }
                else if(foundDivision.length > 0){
                    
                    conn.query('SELECT * FROM topDivs_productsIn WHERE division = ?',req.params.divId,(err,divisionFound)=>{
                        if(divisionFound.length != 5 && req.body.status_id == 1){
                            res.send({
                                success: false,
                                status: 407,
                                message: "Division "+req.params.divId+" has few elements("+divisionFound.length+"), elements must be 5 to be showed"
                            }).status(407)
                        }
                        else{
                            conn.query('UPDATE topDisplayDivisions set division_status = ?  WHERE division_id = ?',[req.body.status_id,req.params.divId],(err,updated)=>{
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
                                        message: "Division status updated successfully"
                                    })
                                }
                            })
                        }
                    })
                   
                }
            })
        })
    }
  
})
module.exports=router;