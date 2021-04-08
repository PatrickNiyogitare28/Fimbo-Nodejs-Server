//-------------foreign key not yet checked befor action
const express = require('express');
const {productsMarksValidator} = require('../utils/validators/productsMarks.validator');
const adminMiddleWare = require('../middlewares/admin');
const router = express.Router();
const {pool} = require('../models/db');


router.post('/newMark',[adminMiddleWare],(req,res)=>{
    const data = req.body;
    const {error} =  productsMarksValidator(data);
    if(error) return res.send(error.details[0].message).status(403);

    pool.getConnection((err,conn)=>{
        conn.query('INSERT INTO productsMarks SET ?',[data],(err,mark)=>{
             if(err){
                
                 res.send({err: err,success: false,status:403}).status(403)
            }
           
                 return res.send({mark: mark,success: true,status:201}).status(201);
         })
    })
})

router.get('/marks',(req,res)=>{
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsMarks',(err,marks)=>{
            if(err){
                res.send({error: err,success:false,status:400}).status(400);
            }
            else{
                res.send({
                    success: true,
                    status: 200,
                    marks: marks
                }).status(200)
            }
        })
    })
})

router.get('/mark/:id',(req,res)=>{
    pool.getConnection((err,conn)=>{
    conn.query('SELECT * FROM productsMarks WHERE mark_id = ?',req.params.id,(err,mark)=>{
        if(mark.length == 0){
            res.send({
                success: false,
                status: 404,
                message: "mark not found"
            }).status(404)
        }
        else{
             conn.query('SELECT *FROM productsMarks WHERE mark_id = ?',req.params.id,(err,mark)=>{
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
                            mark: mark
                        })
                    }
                })
           
        }
    })
})
})

router.put('/updateMark/:id',[adminMiddleWare],(req,res)=>{

    const {error} = productsMarksValidator(req.body);
    if(error) return res.send({
        success: false,
        status: 403,
        error: error.details[0].message
    }).status(403)

    const markId = req.params.id;
    const newMark = req.body;

    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsMarks WHERE mark_id = ?',markId,(err,mark)=>{
          if(mark.length == 0){
              return res.send({
                  success: false,
                  message: "Mark not found",
                  status: 404
              }).status(404)
          }
          else{
            conn.query('UPDATE productsMarks SET ? WHERE mark_id = ?',[newMark,markId],(err,updatedMark)=>{
                
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
                        mark: updatedMark
                    }).status(200)
                }
            })
          }
        })

     
    })
})
router.delete('/removeMark/:id',[adminMiddleWare],(req,res)=>{
    
    pool.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsMarks WHERE mark_id = ?',req.params.id,(err,mark)=>{
            if(mark.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "mark not found"
                }).status(404)
            }
            else{
                conn.query('DELETE FROM products WHERE prod_mark = ?',req.params.id,(err,deletedMark)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    }
                    else{
                        conn.query('DELETE FROM productsMarks WHERE mark_id = ?',req.params.id,(err,removedMark)=>{

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
                                    message: removedMark
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