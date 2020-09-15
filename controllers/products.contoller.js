//-------------foreign key not yet checked befor action
const express = require('express');
const {validateProduct} =  require('../utils/validators/product.validator');
const {ProductUniqueId} = require('../utils/uniqueIds/productUniqueid');
const adminMiddleWare = require('../middlewares/admin');
const authMiddleWare = require('../middlewares/auth')
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const {ImageUniqueName } = require('../utils/uniqueIds/imageUniqueName')

router.post('/newProduct', [authMiddleWare, adminMiddleWare], (req, res) => {
    const data = req.body;
    const {
        error
    } = validateProduct(data);
    if (error) {
        console.log(error)
        return res.send(error.details[0].message).status(403)
    }

    const productSeller = data.prod_seller;
    const productCategory = data.prod_category;
    const productMark = data.prod_mark;
    const productCollections = data.prod_collection;
    const productDetails = data.details;
    const productPrice = data.price;
    const productUsedStatus = data.usedStatus;

    const newProductData = {
        product_id: ProductUniqueId(),
        prod_name: data.prod_name,
        prod_seller: productSeller,
        prod_category: productCategory,
        prod_mark: productMark,
        prod_collection: productCollections,
        details: productDetails,
        price: productPrice,
        usedStatus: productUsedStatus,
        readStatus: 0
    }
    req.getConnection((err, conn) => {

        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?', productSeller, (err, seller) => {
            if (seller.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "seller not found"
                }).status(404)
            } else {
                conn.query('SELECT * FROM productsCategories WHERE category_id = ?', productCategory, (err, category) => {
                    if (category.length == 0) {
                        res.send({
                            success: false,
                            status: 404,
                            message: "category not found"
                        }).status(404)
                    } else {
                        conn.query('SELECT * FROM productsMarks WHERE mark_id = ?', productMark, (err, mark) => {
                            if (mark.length == 0) {
                                res.send({
                                    success: false,
                                    status: 404,
                                    message: "mark not found"
                                }).status(404)
                            } else {
                                conn.query('SELECT * FROM productsCollections WHERE collection_id = ?', productCollections, (err, collection) => {
                                    if (collection.length == 0) {
                                        res.send({
                                            success: false,
                                            status: 404,
                                            message: "collection not found"
                                        }).status(404)
                                    } else {
                                        conn.query('INSERT INTO products SET ?', [newProductData], (err, newProdct) => {
                                            if (err) {
                                                console.log(err)
                                                res.send({
                                                    success: false,
                                                    status: 400,
                                                    message: err
                                                }).status(400)
                                            } else {
                                                res.send({
                                                    success: true,
                                                    status: 201,
                                                    message: "Product Created",
                                                    product: newProdct,
                                                    productId: newProductData.product_id
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
})

router.post('/addProduct',(req,res)=>{
    const data = req.body;
    const {error}=validateProduct(data);
    if(error){return res.send({success:false,status: 400,message:error.details[0].message})}
    const newProduct = {
        product_id: ProductUniqueId(),
        prod_name: data.prod_name,
        prod_seller: data.prod_seller,
        prod_category: data.prod_category,
        prod_mark: data.prod_mark,
        prod_collection: data.prod_collection,
        details: data.details,
        price: data.price,
        usedStatus: data.usedStatus,
        readStatus: 0
    }
    req.getConnection((err,conn)=>{
        if(err){return res.send({success:false,status: 500, message: err}).status(500)}
        conn.query('SELECT * FROM productsCategories  WHERE category_id = ?',[newProduct.prod_category],(err,foundCategory)=>{
            if(err){return res.send({success:false,status: 400, message: err}).status(400)}
            else if(foundCategory.length == 0){
                return res.send({success: false, status: 404, message: "Category not found"}).status(404)
            }
            else if(foundCategory.length > 0){
                conn.query('SELECT * FROM productsCollections WHERE collection_id = ?',
                [newProduct.prod_collection],(err,foundCollection)=>{
                    if(err){return res.send({success:false,status: 400, message: err}).status(400)}
                    else if(foundCollection.length == 0){
                        return res.send({success: false,status: 404, message: "Collection not found"}).status(404)
                    }
                    else if(foundCollection.length > 0){
                        conn.query('SELECT * FROM productsMarks WHERE mark_id = ?',[newProduct.prod_mark],(err,foundMark)=>{
                            if(err){return res.send({success: false,status: 400, message: "Mark not found"}).status(400)}
                            else if(foundMark.length == 0){
                                return res.send({success: false,status: 404, message:"Mark not found"}).status(404)
                            }
                            else if(foundMark.length> 0){
                                conn.query('SELECT * FROM productsSellers WHERE seller_id = ?',[data.prod_seller],(err,foundSeller)=>{
                                    if(err){return res.send({success: false, status: 400, message: err}).status(400)}
                                    else if(foundSeller.length == 0){
                                        return res.send({success: false, status: 404, message:"Seller not found"}).status(404)
                                    }
                                    else if(foundSeller.length > 0){
                                        if(foundSeller[0].account_status == 0 || foundSeller[0].account_status == 1){
                                            return res.send({success: false, statu: 401, message:"Account not activated"}).status(401)
                                        }
                                        else if(foundSeller[0].account_status == 2){
                                            return res.send({success: false, status: 401, message: "Kindly wait for admin approval to start uploading products"})
                                            .status(401)
                                        }
                                        else if(foundSeller[0].account_status == 3){
                                          conn.query('SELECT * FROM plans WHERE plan_id = ?',[foundSeller[0].plan],
                                          (err,sellerPlan)=>{
                                              if(err){return res.send({success: false,status:400, message: err}).status(400)}
                                              else{
                                                  if(sellerPlan[0].plan_id != 4){
                                                    conn.query('SELECT * FROM products WHERE prod_seller = ?',[data.prod_seller],(err,createdProducts)=>{
                                                        if(err){return res.send({success:false,status: 400, message:err}).status(400)}
                                                        else{
                                                            if(createdProducts.length == sellerPlan[0].max_products || 
                                                              createdProducts.length > sellerPlan[0].max_products){
                                                                res.send({success:false, status: 402,
                                                                message:"You have reached the maximum of your plan. Delete some products or buy a new Plan",
                                                                plan_name: sellerPlan[0].plan_name}).status(402)
                                                            }
                                                            else{
                                                                conn.query('INSERT INTO products SET ?',[newProduct],(err,isProductCreated)=>{
                                                                    if(err){return res.send({success:false,status:400, message: err}).status(400)}
                                                                    else{
                                                                        let remainingProuducts = ((sellerPlan[0].max_products-1) - createdProducts.length);
                                                                        return res.send({success: true,status:201,message: "Product created",
                                                                        productId:newProduct.product_id,
                                                                        plan: sellerPlan[0].plan_name,
                                                                        remainingProducts:remainingProuducts}).status(201)
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                  }else{
                                                    conn.query('INSERT INTO products SET ?',[newProduct],(err,isProductCreated)=>{
                                                        if(err){return res.send({success:false,status:400, message: err}).status(400)}
                                                        else{
                                                            return res.send({success: false,status:201,message: "Product created",
                                                            productId:newProduct.product_id,
                                                            plan: sellerPlan[0].plan_name
                                                         }).status(201)
                                                        }
                                                    })  
                                                  }
                                                  
                                              }
                                          })
                                        }
                                        else{
                                            return res.send({success: false, status:400, message:"Error occured"}).status(400)
                                        }
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

//-------------------------------------multer uploading the poduct image----------------------------------------
//-------------------------- DECLAIRING THE IMAGE STORAGE----------------------
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'utils/uploads/productsImages')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${ImageUniqueName()}-${file.originalname.toLowerCase()}`)
    }
})
const upload = multer({
    storage: storage
})

//----------------------------END OF DECLAIRING THE IMAGE STORAGE------------------------

//----------------------------PROCESSING THE REQUEST-------------------------------------
router.post('/productImage', upload.single('file'), (req, res, next) => {
    const file = req.file;
    const productId = req.header('product-id')

    // console.log(file.filename);
    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error)
    }

    req.getConnection((err, conn) => {
        conn.query(' UPDATE products SET image_name= ? WHERE product_id= ?', [file.filename, productId], (err, product) => {
            if (err) {
                return res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            } else {
                return res.send({
                    success: true,
                    status: 200,
                    message: product
                }).status(200)
            }
        })
    })
})
//------------------------------ END OF PROCESSING THE REQUEST--------------------------------
//--------------------------------------------end of multer uploading the product image ---------------------------


//---------------------------------------updating the product image by multer--------------------------------------
router.post('/updateProductImage', upload.single('file'), (req, res, next) => {
    const file = req.file;
    const productId = req.header('product-id')

    // console.log(file.filename);
    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400
        return next(error)
    }

    req.getConnection((err, conn) => {
        conn.query(' UPDATE products SET image_name= ? WHERE product_id= ?', [file.filename, productId], (err, product) => {
            if (err) {
                return res.send({
                    success: false,
                    status: 400,
                    message: err
                }).status(400)
            } else {
                return res.send({
                    success: true,
                    status: 200,
                    message: product
                }).status(200)
            }
        })
    })
})
//----------------------------------------end of updating product image-------------------------------------------

router.get('/product/:id', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM products WHERE product_id = ?', req.params.id, (err, product) => {
            if (product.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "product not found"
                }).status(404)
            } else {
                conn.query('SELECT *FROM products WHERE product_id = ?', req.params.id, (err, product) => {
                    if (err) {
                        res.send({
                            error: err,
                            success: false,
                            status: 400
                        }).status(400)
                    } else {
                        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?', product[0].prod_seller, (err, seller) => {
                            if (err) {
                                res.send({
                                    success: false,
                                    error: err
                                })

                            } else {

                                conn.query('SELECT * FROM productsCategories where category_id = ?', product[0].prod_category, (err, category) => {
                                    if (err) {
                                        res.send({
                                            success: false,
                                            status: 400,
                                            error: err
                                        }).status(400)
                                    } else {

                                        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?', product[0].prod_collection, (err, collection) => {
                                            if (err) {
                                                res.send({
                                                    success: false,
                                                    status: 400,
                                                    error: err
                                                }).status(400)
                                            } else {
                                                conn.query('SELECT * FROM productsMarks WHERE mark_id = ?', product[0].prod_mark, (err, mark) => {
                                                    if (err) {
                                                        res.send({
                                                            success: false,
                                                            status: 400,
                                                            error: err
                                                        }).status(400)
                                                    } else {
                                                        res.send({
                                                            success: true,
                                                            status: 200,
                                                            productId: product[0].product_id,
                                                            productName: product[0].prod_name,
                                                            productCategory: category[0].category_name,
                                                            categoryId: category[0].category_id,
                                                            productCollection: collection[0].collection_name,
                                                            collectionId: collection[0].collection_id,
                                                            productMark: mark[0].mark_name,
                                                            markId: mark[0].mark_id,
                                                            productSeller: seller[0].seller_name,
                                                            sellerId: seller[0].seller_id,
                                                            sellerWatsapp: seller[0].seller_watsapp_phone,
                                                            sellerContact: seller[0].seller_contact_phone,
                                                            sellerCountry: seller[0].seller_country,
                                                            sellerDistrict: seller[0].seller_district,
                                                            sellerSector: seller[0].seller_sector,
                                                            sellerTown: seller[0].seller_town,
                                                            imageName: product[0].image_name,
                                                            price: product[0].price,
                                                            usedStatus: product[0].usedStatus,
                                                            details: product[0].details
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
})

router.get('/allProducts', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM products', (err, products) => {
            res.send({
                success: true,
                status: 200,
                product: products
            }).status(200)
        })
    })
})

//------------------------------------------get all products by categories-----------------------------------
router.get('/productsByCategory/:catId', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsCategories WHERE category_id = ?',req.params.catId,(err,foundCategory)=>{
            if(err){
                return res.send({
                    success:false,
                    status: 400,
                    message: err
                }).status(400)
            }else if(foundCategory.length == 0){
                 return res.send({
                     success: false,
                     status: 404,
                     message: "Category not found"
                 }).status(404)
            }
            else{
                conn.query('SELECT * FROM products WHERE prod_category = ?',req.params.catId, (err, products) => {
                    return res.send({
                        success: true,
                        status: 200,
                        product: products
                    }).status(200)
                })
            }
        })
     
    })
})
//------------------------------------------end get all products by categories-----------------------------------


router.put('/updateCollection/:id', [adminMiddleWare], (req, res) => {

    const {
        error
    } = productsCollectionsValidator(req.body);
    if (error) return res.send({
        success: false,
        status: 403,
        error: error.details[0].message
    }).status(403)

    const colId = req.params.id;
    const newCollection = req.body;

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?', colId, (err, collection) => {
            if (collection.length == 0) {
                return res.send({
                    success: false,
                    message: "Collection not found",
                    status: 404
                }).status(404)
            } else {
                conn.query('UPDATE productsCollections SET ? WHERE collection_id = ?', [newCollection, colId], (err, updatedCollection) => {

                    if (err) {
                        res.send({
                            success: false,
                            status: 400,
                            error: err

                        }).status(400)
                    } else {
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

//---------------------------------------------get products by categories---------------------------------------
router.get('/byCategory/:id', (req, res) => {
    console.log("hello..")
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsCategories WHERE category_id = ?', req.params.id, (err, category) => {
            if (category.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "category not found"
                }).status(404)
            } else {
                conn.query('SELECT* FROM products WHERE prod_category = ?', req.params.id, (err, products) => {

                    if (err) {
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } else {
                        res.send({
                            success: true,
                            status: 200,
                            products
                        }).status(200)
                    }
                })
            }
        })


    })
})


//---------------------------------------------get products by collection---------------------------------------
router.get('/byCollection/:id', (req, res) => {

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsCollections WHERE collection_id = ?', req.params.id, (err, collection) => {
            if (collection.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "collection not found"
                }).status(404)
            } else {
                conn.query('SELECT* FROM products WHERE prod_collection = ?', req.params.id, (err, products) => {

                    if (err) {
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } else {
                        res.send({
                            success: true,
                            status: 200,
                            products
                        }).status(200)
                    }
                })
            }
        })


    })
})


//---------------------------------------------get products by mark---------------------------------------
router.get('/byMark/:id', (req, res) => {

    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsMarks WHERE mark_id = ?', req.params.id, (err, mark) => {
            if (mark.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "mark not found"
                }).status(404)
            } else {
                conn.query('SELECT* FROM products WHERE prod_mark = ?', req.params.id, (err, products) => {

                    if (err) {
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } else {
                        res.send({
                            success: true,
                            status: 200,
                            products
                        }).status(200)
                    }
                })
            }
        })


    })
})


//---------------------------------------------get products by sellers---------------------------------------
router.get('/bySeller/:id', (req, res) => {
    req.getConnection((err, conn) => {
        conn.query('SELECT * FROM productsSellers WHERE seller_id = ?', [req.params.id], (err, isFound) => {
         if (isFound.length == 0) {
                res.send({
                    success: false,
                    status: 404,
                    message: "seller not found*"
                }).status(404)
            } else {
                conn.query('SELECT* FROM products WHERE prod_seller = ?', req.params.id, (err, products) => {

                    if (err) {
                        res.send({
                            success: false,
                            status: 400,
                            message: err
                        }).status(400)
                    } else {
                        res.send({
                            success: true,
                            status: 200,
                            products
                        }).status(200)
                    }
                })
            }
        })


    })
})

//-----------------------------------------------updating the product--------------------------------------
router.put('/updateProduct/:id', [authMiddleWare], (req, res) => {

  //--------------------------------------------check if the product exists-------------------------------
  req.getConnection((err,conn)=>{
      conn.query('SELECT * FROM products WHERE product_id = ?',[req.params.id],(err,foundProduct)=>{
          if(err){
              res.send({
                  success: false,
                  status: 400,
                  message: err
              }).status(400)
          }
          else{
              if(foundProduct.length==0){
                  res.send({
                      success: false,
                      status: 404,
                      message: "Product no found"
                  }).status(404)
              }
              else{
                const data = req.body;
                const {
                    error
                } = validateProduct(data);
                if (error) {
                    console.log(error)
                    return res.send(error.details[0].message).status(403)
                }
            
                const productSeller = data.prod_seller;
                const productCategory = data.prod_category;
                const productMark = data.prod_mark;
                const productCollections = data.prod_collection;
                const productDetails = data.details;
                const productPrice = data.price;
                const productUsedStatus = data.usedStatus;
            
                const newProductData = {
                    prod_name: data.prod_name,
                    prod_seller: productSeller,
                    prod_category: productCategory,
                    prod_mark: productMark,
                    prod_collection: productCollections,
                    details: productDetails,
                    price: productPrice,
                    usedStatus: productUsedStatus
                }
                req.getConnection((err, conn) => {
                    
                    conn.query('SELECT * FROM productsSellers WHERE seller_id = ?', [productSeller], (err, seller) => {
                        if (seller.length == 0) {
                            res.send({
                                success: false,
                                status: 404,
                                message: "seller not found"
                            }).status(404)
                        } else {
                            conn.query('SELECT * FROM productsCategories WHERE category_id = ?', [productCategory], (err, category) => {
                                if (category.length == 0) {
                                    res.send({
                                        success: false,
                                        status: 404,
                                        message: "category not found"
                                    }).status(404)
                                } else {
                                    conn.query('SELECT * FROM productsMarks WHERE mark_id = ?', [productMark], (err, mark) => {
                                        if (mark.length == 0) {
                                            res.send({
                                                success: false,
                                                status: 404,
                                                message: "mark not found"
                                            }).status(404)
                                        } else {
                                            conn.query('SELECT * FROM productsCollections WHERE collection_id = ?', [productCollections], (err, collection) => {
                                                if (collection.length == 0) {
                                                    res.send({
                                                        success: false,
                                                        status: 404,
                                                        message: "collection not found"
                                                    }).status(404)
                                                } else {
                                                    conn.query('UPDATE products SET ? where product_id = ?', [newProductData,req.params.id], (err, newProdct) => {
                                                        if (err) {
                                                            console.log(err)
                                                            res.send({
                                                                success: false,
                                                                status: 400,
                                                                message: err
                                                            }).status(400)
                                                        } else {
                                                            res.send({
                                                                success: true,
                                                                status: 201,
                                                                message: "Product Created",
                                                                product: newProdct,
                                                                productId: newProductData.product_id
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
              }
          }
      })
  })


})

router.delete('/removeProduct/:id',[authMiddleWare],(req,res)=>{
  req.getConnection((err,conn)=>{
      conn.query('SELECT * FROM products WHERE product_id = ?',[req.params.id],(err,foundProduct)=>{
          if(err){
              res.send({
                  success: false,
                  status: 400,
                  message: err
              }).status(404)
          }
         else if(foundProduct.length==0){
              res.send({
                  success: false,
                  status: 404,
                  message: "Product not found"
              }).status(404)
          }
          else{
              conn.query('DELETE FROM products WHERE product_id = ?',req.params.id,(err,removedProduct)=>{
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
                          message: removedProduct,
                          productName: foundProduct[0].prod_name
                      })
                  }
              })
          }
      })
  })
})

//--------------------------------------------get products in the same collection---------------------------
router.get('/relatedCollectionProducts/:productId',(req,res)=>{
    req.getConnection((err,conn)=>{
        if(err){
            res.send({
                success: false,
                status: 400,
                message: err
            }).status(400)
        }
        else{
            conn.query('SELECT * FROM products WHERE product_id = ?',req.params.productId,(err,foundProduct)=>{
                if(err){
                    res.send({
                        success: false,
                        status: 400,
                        message: err
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
                        conn.query('SELECT * FROM products WHERE prod_collection = ? AND product_id != ?',
                        [foundProduct[0].prod_collection,req.params.productId],(err,products)=>{
                            if(err){
                                res.send({
                                    success: false,
                                    status: 400,
                                    message: err
                                }).status(400)
                            }
                            else{
                                if(products.length == 0){
                                    res.send({
                                        success: true,
                                        status: 200,
                                        length: 0
                                    }).status(200)
                                }
                                else{
                                    res.send({
                                        success: true,
                                        status: 200,
                                        length: products.length,
                                        products: products
                                    }).status(200)
                                }
                            }
                        })
                    }
                }
            })
        }
    })
})
module.exports = router;