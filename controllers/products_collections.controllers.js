//-------------foreign key not yet checked befor action
const express = require('express');
const {productsCollectionsValidator} = require('../utils/validators/productsCollections.validators');
const adminMiddleWare = require('../middlewares/admin');
const router = express.Router();

router.post('/newCollection',[adminMiddleWare],(req,res)=>{
    const data = req.body;
    const {error} =  productsCollectionsValidator(data);
    if(error) return res.send(error.details[0].message).status(403);

    req.getConnection((err,conn)=>{
        conn.query('INSERT INTO productsCollections SET ?',[data],(err,collection)=>{
             if(err){
                
                 res.send({err: err,success: false,status:403}).status(403)
            }
           
                 return res.send({collection: collection,success: true,status:201}).status(201);
         })
    })
})

router.get('/collections',(req,res)=>{
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCollections',(err,collections)=>{
            if(err){
                res.send({error: err,success:false,status:400}).status(400);
            }
            else{
                res.send({
                    success: true,
                    status: 200,
                    collections: collections
                }).status(200)
            }
        })
    })
})

router.get('/collection/:id',(req,res)=>{
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?',req.params.id,(err,collection)=>{
            if(collection.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "collection not found"
                }).status(404)
            }
            else{
                conn.query('SELECT *FROM productsCollections WHERE collection_id = ?',req.params.id,(err,collection)=>{
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
                            collection: collection
                        })
                    }
                })
            }
     })
    })
})

router.put('/updateCollection/:id',[adminMiddleWare],(req,res)=>{

    const {error} = productsCollectionsValidator(req.body);
    if(error) return res.send({
        success: false,
        status: 403,
        error: error.details[0].message
    }).status(403)

    const colId = req.params.id;
    const newCollection = req.body;

    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?',colId,(err,collection)=>{
          if(collection.length == 0){
              return res.send({
                  success: false,
                  message: "Collection not found",
                  status: 404
              }).status(404)
          }
          else{
            conn.query('UPDATE productsCollections SET ? WHERE collection_id = ?',[newCollection,colId],(err,updatedCollection)=>{
                
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
                        collection: updatedCollection
                    }).status(200)
                }
            })
          }
        })

     
    })
})
router.delete('/removeCollection/:id',[adminMiddleWare],(req,res)=>{
    
    req.getConnection((err,conn)=>{
        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?',req.params.id,(err,collection)=>{
            if(collection.length == 0){
                res.send({
                    success: false,
                    status: 404,
                    message: "collection not found"
                }).status(404)
            }
            else{
                conn.query('DELETE FROM products WHERE prod_collection = ?',req.params.id,(err,deletedProd)=>{
                    if(err){
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    }
                    else{
                        conn.query('DELETE FROM productsCollections WHERE collection_id = ?',req.params.id,(err,removedCollection)=>{

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
                                    removedCollection: removedCollection
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