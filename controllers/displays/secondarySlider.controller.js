const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middlewares/admin');
const {pool} = require('../../models/db');


router.post('/addProduct/product/:product',async(req,res) => {
  const data = {
      product: req.params.product
  };
  pool.getConnection((err,conn)=> {
      if(err) return res.send({
          success: false,
          status: 500,
          message: err
      }).status(500)

      conn.query('SELECT * FROM products WHERE product_id = ?',[data.product],(err,isProduct)=> {
          if(err) return res.send({
              success: false,
              status: 400,
              message: err
          }).status(400);

          if(isProduct.length == 0){
              return res.send({
                  success: false,
                  status: 404,
                  message: "Product not found"
              }).status(404)
          }

          conn.query("SELECT * FROM secondarySlider WHERE product = ?",[data.product],(err,productExist)=> {
              if(err) return res.send({
                  success: false,
                  status: 400,
                  message: err
              }).status(400)

              if(productExist.length > 0) return res.send({
                  success: false,
                  status: 409,
                  message: "Product already exist"
              }).status(409)

              conn.query('INSERT INTO secondarySlider SET ?',[data],(err, porodutCreated)=> {
                if(err) return res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)

                res.send({
                      success: true,
                      status: 200,
                      message: "Product Added successfully"
                  }).status(200);
              })
          })
      })
  })
})

router.get('/getProducts',(req,res)=> {
    pool.getConnection((err,conn)=> {
        if(err) return res.send({
            success: false,
            status: 500,
            message: err
        }).status(500);

        conn.query('SELECT * FROM secondarySlider',(err,products)=> {
           if(err) return res.send({
               success: false,
               status: 500,
               message: err
           }).status(500);

           res.send({
               success: true,
               status: 200,
               products: products
           }).status(200);
        })
    })
})

module.exports = router;