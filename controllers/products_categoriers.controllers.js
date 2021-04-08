//-------------foreign key not yet checked befor action
const express = require('express');
const {productsCategoriesValidator} = require('../utils/validators/productsCategories.validator');
const adminMiddleWare = require('../middlewares/admin');
const router = express.Router();
const {pool} = require('../models/db');


router.post('/newCategory',[adminMiddleWare],(req,res)=>{
    const data = req.body;
    const {error} =  productsCategoriesValidator(data);
    if(error) return res.send(error.details[0].message).status(403);

    pool.getConnection((err,conn)=>{
        conn.query('INSERT INTO productsCategories SET ?',[data],(err,category)=>{
             if(err){
                
                 res.send({error: err,success: false,status:403}).status(403)
            }
           
                 res.send({category: category,success: true,status:201}).status(201);
         })
    })
})

router.get('/categories',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT *FROM productsCategories',(err,categories)=>{
            if(err){
                res.send({error: err,success:false,status:400}).status(400);
            }
            else{
                // console.log("got......")
                res.send({
                    success: true,
                    status: 200,
                    categories: categories
                }).status(200)
            }
        })
    })
})

router.get('/category/:id',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCategories WHERE category_id = ?',req.params.id,(err,category)=>{
            if(category.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "category not found"
                }).status(404)
            }
          else{
            conn.query('SELECT *FROM productsCategories WHERE category_id = ?',req.params.id,(err,category)=>{
                if(err){
                    res.send({
                        error: err,
                        success: false,
                        status: 400
                    }).status(400)
                }
                else{
                    res.send({
                        success: true,
                        status: 200,
                        category: category
                    })
                }
            })
          }  
        
    })
    })
})

router.put('/updateCategory/:id',[adminMiddleWare],(req,res)=>{

    const {error} = productsCategoriesValidator(req.body);
    if(error) return res.send({
        success: false,
        status: 403,
        error: error.details[0].message
    }).status(403)

    const catId = req.params.id;
    const newCategory = req.body;

    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCategories WHERE category_id = ?',catId,(err,category)=>{
          console.log("categoryLength"+category.length)  
          if(category.length == 0){
              return res.send({
                  success: false,
                  message: "Category not found",
                  status: 404
              }).status(404)
          }
          else{
            conn.query('UPDATE productsCategories SET ? WHERE category_id = ?',[newCategory,catId],(err,updatedCategory)=>{
                
                if(err){
                    res.send({
                        success:false,
                        status: 400,
                        error: err
    
                    }).status(400)
                }
                else{
                    res.send({
                        success: true,
                        status: 200,
                        category: updatedCategory
                    }).status(200)
                }
            })
          }
        })

     
    })
})
router.delete('/removeCategory/:id',[adminMiddleWare],(req,res)=>{
    
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCategories WHERE category_id = ?',req.params.id,(err,category)=>{
            if(category.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "category not found"
                }).status(404)
            }
            else{
                conn.query('DELETE FROM products WHERE prod_category = ?',req.params.id,(err,prod)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        })
                    }
                    else{
                        conn.query('DELETE FROM productsCategories WHERE category_id = ?',req.params.id,(err,removedCategory)=>{

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
                                    removedCategory: removedCategory
                                }).status(200)
                            }
                        })
                    }
                })
              
            }
        })

       
    })
})
module.exports=router;