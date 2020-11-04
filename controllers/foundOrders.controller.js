const express = require('express');
const {foundProductValidator} = require('../utils/validators/foundProduct.validator');
const router = express.Router();
const {pool} = require('../models/db');


router.post('/',(req,res)=>{
    const data = req.body;
    const {error}=foundProductValidator(data);
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400)
    const dataObject = {
        customer_order: data.order,
        seller: data.seller
    }
    
    pool.getConnection((err,conn)=>{
        if(err) return res.send({success: false, status: 500, message: err}).status(500)
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[data.seller],(err,foundSeller)=>{
            if(err){return res.send({success:false, status: 400, message: err}).status(400)}
            else if(foundSeller.length == 0){
                return res.send({success: false, status: 404, message: "Seller not found"}).status(404)
            }
            else if(foundSeller.length == 1){
                conn.query('SELECT * FROM orders WHERE order_id = ?',[data.order],(err,foundOrder)=>{
                    if(err){return res.send({success:false, status: 400, message: err}).status(400)}
                    else if(foundOrder.length == 0){
                        return res.send({success: false, status: 404, message: "Order not found"}).status(404)
                    }
                    else if(foundOrder.length == 1){
                        conn.query('SELECT * FROM foundOrders WHERE customer_order = ? AND seller = ?',
                        [data.order,data.seller],(err,orderAlreadyReported)=>{
                            if(err){ return res.send({success: false, status: 400, message: err}).status(400)}
                            else if(orderAlreadyReported.length > 0){
                                return res.send({success: false, status: 208, message:"Order already checkedout"})
                                .status(208)
                            }
                            else{
                                conn.query('INSERT INTO foundOrders SET ?',[dataObject],(err,result)=>{
                                    if(err){ return res.send({success: false,status: 400, message: err}).status(400)}
                                    else{
                                        return res.send({
                                            success: true,
                                            status: 200,
                                            message: result
                                        }).status(200)
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{ return res.send({success: false, status: 400, message:"Error occured"}).status(400)}
        })
    })
})
// router.get('/customerOrder/:userId',(req,res)=>{
//     pool.getConnection((err,conn)=>{
//         if(err) return res.send({success:false,status: 500, message: err}).status(400)
//         conn.query('SELECT * FROM users WHERE user_id = ?',[req.params.userId],(err,isUser)=>{
//             if(err) return res.send({success: false, status: 400, message: err}).status(400)
//             else if(isUser.length == 0){
//                 return res.send({success: false,status: 404, message: "User not found"}).status(404)
//             }
//             else if(isUser.length == 1){
//                 conn.query('SELECT * FROM foundOrders WHERE ')
//             }
//             else{
//                 return res.send({success:false, status: 400, message: "An error occured"}).status(400)
//             }
//         })
//     }) 
// })
router.get('/:orderId',(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err)return res.send({success: false, status: 500, message: err}).status(500)
        conn.query('SELECT * from orders WHERE order_id = ?',[req.params.orderId],(err,isOrder)=>{
            if(err) return res.send({success:false, status: 400, message:err}).status(400)
            else if(isOrder.length ==  0){
                return res.send({success: false, status: 404, message: "Invalid order"}).status(400)
            }
            else if(isOrder.length == 1){
                conn.query('SELECT * FROM foundOrders WHERE customer_order = ?',
                [req.params.orderId],(err,orderFound)=>{
                    if(err){return res.send({success:false,status: 400,})}
                    else if(orderFound.length > 0){
                        return res.send({success: true,status: 200,founds: orderFound.length,
                            message:"Found",foundOrder: orderFound})
                        .status(200);
                    }
                    else if(orderFound.length == 0){
                        return res.send({success:true, status:404, founds:0,message:"Pending"})
                        .status(404);
                    }
                })
            }
            else{
                return res.send({success: false, status: 400,message: "An error occured"}).status(400)
            }
        })
        
    })
})

router.put('/uncheckOrder/:vendorId/:orderId',(req,res)=>{
    pool.getConnection((error,conn)=>{
        if(error) return res.send({success: false, status: 500, message:error}).status(500)
        conn.query('SELECT * FROM foundOrders WHERE customer_order = ? AND seller = ?',
        [req.params.orderId,req.params.vendorId],(err, order)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(order.length == 0){
                return res.send({success: false, status: 404, message: "Order not found"}).status(404)
            }
            else if(order.length == 1){
                conn.query('DELETE FROM foundOrders WHERE customer_order = ? and seller = ?',
                [req.params.orderId,req.params.vendorId],(err,removed)=>{
                    if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                    else {
                        return res.send({success: true, status: 200, message:  "Order removed.", removed}).status(200)
                    }
                })
            }
            else{
                return res.send({success: false, status: 400, message: "An error occured"}).status(400)
            }
        })
    })
})
module.exports=router;