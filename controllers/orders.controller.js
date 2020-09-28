 const express = require('express');
 const {validateNewOrder} = require('../utils/validators/order.validator');
 const authMiddleWare = require('../middlewares/auth');
 const multer = require('multer');
 const router = express.Router();
 const {ImageUniqueName} = require('../utils/uniqueIds/imageUniqueName');
 const _ = require('lodash');

 router.post('/newOrder',[authMiddleWare],(req,res)=>{
     const data = req.body;
     const {error} = validateNewOrder(data);
     const body = {
         order_name: data.orderName,
         description: data.description,
         user: data.user
     }
     if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400)
     req.getConnection((err,conn)=>{
         if(err) return res.send({success:false,status: 500,message: err}).status(500)
         conn.query('SELECT * FROM users WHERE user_id = ?',[body.user],(err,isUser)=>{
             if(err){return res.send({success: false, status: 400, message: err}).status(400)}
             else if(isUser.length == 0){
                 return res.send({success: false, status: 404, message: "User not found"}).status(404)
             }
             else if(isUser.length == 1){
                 conn.query('INSERT INTO orders SET ?',[body],(err,orderCreated)=>{
                     if(err){return res.send({success:false,status: 400, message: err}).status(400)}
                     else{
                       return res.send({success: true, message: "Order created",order: orderCreated,status: 201})
                         .status(201)
                     }
                 })
             }
             else{
                 return res.send({success: false,status: 400, message: "An error occured!"}).status(400)
             }
         })
     })
 })

//-------------------------------------multer uploading the seller logo----------------------------------------
//-------------------------- DECLAIRING THE LOGO STORAGE----------------------
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'utils/uploads/orderImages')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${ImageUniqueName()}`)
    }
})
const upload = multer({
    storage: storage
})
//----------------------------END OF DECLAIRING THE IMAGE STORAGE------------------------

//----------------------------PROCESSING THE REQUEST-------------------------------------

router.post('/addOrderImage', upload.single('file'), (req, res, next) => {
    const file = req.file;
    const orderId = req.header('order-id')
    if (!file) {
        const error = new Error('No File')
        res.send({
            success: false,status: 400, error
        }).status(400)
        error.httpStatusCode = 400
        return next(error)
    }
    
    req.getConnection((err,conn)=>{
        if(err) return res.send({success:false,status: 500,message: err}).status(500)
        conn.query('SELECT * FROM orders WHERE order_id = ?',[orderId],(err,isOrder)=>{
          if(err){return res.send({success:false, status: 400, message: err}).status(400)}
          else if(isOrder.length == 0){
              return res.send({success:false,status: 404, message: "Order not found"}).status(404)
          }  
          else if(isOrder.length == 1){
            conn.query('UPDATE orders SET orderImage = ? WHERE order_id = ?',[file.filename,orderId],(err,imageCreated)=>{
                if(err){return res.send({success:false,status: 400, message: err}).status(400)}
                else{
                    return res.send({success: true, message: "Image added",order: imageCreated,status: 200})
                    .status(200)
                }
            })
          }else{ return res.send({success:false,status: 400, message: "Error occured!"}).status(400)}
        })
    })
})

 router.get('/allOrder',(req,res)=>{
     req.getConnection((err,conn)=>{
         if(err) return res.send({success: false,status: 500, message: err}).status(500)
          conn.query('SELECT * FROM orders  WHERE order_status = 1',(err,orders)=>{
             if(err) return res.send({success:false, status: 400,message: err}).status(400)
             return res.send({
                 success:true, status: 200,orders: orders
             }).status(200)
         })
     })
 })

 router.get('/userOrders/:userId',[authMiddleWare],(req,res)=>{
   req.getConnection((err,conn)=>{
        if(err) return res.send({success:false,status: 500,message: err}).status(500)
        conn.query('SELECT * FROM users WHERE user_id = ?',[req.params.userId],(err,isUser)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(isUser.length == 0){
                return res.send({success: false, status: 404, message: "User not found"}).status(404)
            }
            else if(isUser.length == 1){
                conn.query('SELECT * FROM orders WHERE user = ?  ORDER BY `order_id` DESC',[req.params.userId],(err,orderCreated)=>{
                    if(err){return res.send({success:false,status: 400, message: err}).status(400)}
                    else{
                        return res.send({success: true, message: "Order created",orders: orderCreated,status: 200})
                        .status(200)
                    }
                })
            }
            else{
                return res.send({success: false,status: 400, message: "An error occured!"}).status(400)
            }
        })
    })
 })
 router.put('/udpateOrder',[authMiddleWare],(req,res)=>{
    const data = req.body;
    const {error} = validateNewOrder(data);
    const body = {
        order_name: data.orderName,
        description: data.description,
        user: data.user
    }
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400)
    req.getConnection((err,conn)=>{
        if(err) return res.send({success:false,status: 500,message: err}).status(500)
        conn.query('SELECT * FROM users WHERE user_id = ?',[body.user],(err,isUser)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(isUser.length == 0){
                return res.send({success: false, status: 404, message: "User not found"}).status(404)
            }
            else if(isUser.length == 1){
                conn.query('UPDATE orders SET ?',[body],(err,orderCreated)=>{
                    if(err){return res.send({success:false,status: 400, message: err}).status(400)}
                    else{
                        return res.send({success: true, message: "Order created",order: orderCreated,status: 200})
                        .status(200)
                    }
                })
            }
            else{
                return res.send({success: false,status: 400, message: "An error occured!"}).status(400)
            }
        })
    })
 })
 router.delete('/removeOrder/:orderId',[authMiddleWare],(req,res)=>{
     req.getConnection((err,conn)=>{
         if(err){ return res.send({success:false,status: 500,message:err}).status(500)}
         conn.query('SELECT * FROM orders WHERE order_id = ?',[req.params.orderId],(err,isOrder)=>{
             if(err){ return res.send({success:false,status: 400,message:err}).status(400)}
             if(isOrder.length == 0){
                 return res.send({success: false,status: 404, message: "Order not found"}).status(404)
             }
             else if(isOrder.length == 1){
                 conn.query('UPDATE foundOrders SET order_status = 0 WHERE customer_order = ?',[req.params.orderId],(err,result)=>{
                  if(err){return res.send({success:false,status: 400,message:err}).status(400)}
                  else{
                      conn.query('DELETE FROM orders WHERE order_id = ?',[req.params.orderId],(err,removed)=>{
                        if(err){return res.send({success:false,status: 400,message:err}).status(400)}
                        else{
                            return res.send({success: true, status: 200, message: "Order removed"}).status(200)
                        }
                      })
                  }
                 })
             }
             else{
                 res.send({success:false, status: 400,message:"An error occured"}).status(400)
             }
         })
     })
 })

 router.get('/checkedout/:vendorId/:orderId',(req,res)=>{ 
     req.getConnection((error,conn)=>{
        if(error){return res.send({success:false,status: 500, message:error}).status(500)}
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[req.params.vendorId],(err,isVendor)=>{
            if(err)return req.send({success: false, status: 400, message: err}).status(400)
            else if(isVendor.length == 0){
                return res.send({success:false, status: 404, message: "Seller not found"}).status(400)
            }
            else if(isVendor.length == 1){
                conn.query('SELECT * FROM orders WHERE order_id = ?',[req.params.orderId],(err,isOrder)=>{
                    if(err)return res.send({success:false, status: 400,message: err}).status(400)
                    else if(isOrder.length == 0){
                        return res.send({success: false,status: 404, message: "Order not found"}).status(400)
                    }
                    else if(isOrder.length == 1 && isOrder[0].order_status == 0){
                        return res.send({success: false, status: 404, message: "Order was caunceled out"}).status(404)
                    }
                    else if(isOrder.length == 1 && isOrder[0].order_status == 1){
                        conn.query('SELECT * FROM foundOrders WHERE customer_order = ? AND seller = ?',
                        [req.params.orderId,req.params.vendorId],(err,isCheckedOut)=>{
                            if(err) return res.send({success: false, status: 400, message: err}).status(400)
                            else{
                                if(isCheckedOut.length == 0){
                                    return res.send({success: false, status: 200,message: "Order not checked out"}).status(200)
                                }
                                else if(isCheckedOut.length == 1){
                                    return res.send({success: true, status: 200, message:"Order is checked out"}).status(200)
                                }
                                else{
                                    return res.send({success: false, status: 400, message: "An error occured"}).status(400)
                                }
                            }
                        })
                    }
                    else{
                        return res.send({success: false, status: 400, message: 'An error occured'}).status(400)
                    }
                })
            }
            else{
                return res.send({success:false,status: 400, message: "An error occured"}).status(400)
            }
        })
     })
 })
 router.get('/:orderId',(req,res)=>{
  req.getConnection((error,conn)=>{
         if(error) return res.send({success:false, status: 500, message:error}).status(500);
         conn.query('SELECT * FROM orders WHERE order_id = ?',[req.params.orderId],
         (err,isOrder)=>{
             if(err){return res.send({success: false, status: 400, message: err}).status(400)}
             else if(isOrder.length == 0){
                 return res.send({success:false, status: 404, message: "Order not found"}).status(400);
             }
             else{
             res.send({success: true, status: 200,
                     order: _.pick(isOrder[0],['order_id','order_name','description','user',
                    'order_status','orderImage','order_date'])}).status(200);
                    
             }
         })  
     })
 })
 module.exports=router;