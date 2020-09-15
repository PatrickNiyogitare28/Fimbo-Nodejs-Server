const express = require('express');
const {foundProductValidator} = require('../utils/validators/foundProduct.validator');
const router = express.Router();

router.post('/',(req,res)=>{
    const data = req.body;
    const {error}=foundProductValidator(data);
    if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400)
    const dataObject = {
        customer_order: data.order,
        seller: data.seller
    }
    req.getConnection((err,conn)=>{
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
                                return res.send({success: false, status: 208, message:"Order already reported"})
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

module.exports=router;