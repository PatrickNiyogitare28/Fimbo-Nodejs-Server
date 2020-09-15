var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const morgan = require('morgan')
const userController = require('./controllers/user.controllers');
const authController = require('./controllers/auth.controller')
const productsCategories = require('./controllers/products_categoriers.controllers');
const productsCollections = require('./controllers/products_collections.controllers')
const productsMarks = require('./controllers/products_marks.controller')
const productsSellers = require('./controllers/products_sellers.controller')
const products = require('./controllers/products.contoller')
const topDisplayDivisionsController = require('./controllers/displays/topDisplayDivisions.controller')
const rateProductController = require('./controllers/productsRates.controller')
const shoppingCartController = require('./controllers/shoppingCart.controller')
const emailVerificationController = require('./controllers/emailVerification.controller')
const usersAddresseController = require('./controllers/usersAddresses.controller')
const planController = require('./controllers/plans.controller');
const orderController = require('./controllers/orders.controller');
const foundOrdersController = require('./controllers/foundOrders.controller');
const authMiddleWare = require('./middlewares/auth');
const adminMiddleWare = require('./middlewares/admin');
const multer = require('multer')
const { ImageUniqueName } = require('./utils/uniqueIds/imageUniqueName')

const app = express();
app.use(bodyParser.json())
app.use(cors());
app.use(cors({ origin: "*" }));


app.use(
    bodyParser.urlencoded({extended: true})
)

app.use(morgan('dev'));
app.use(myConnection(mysql, {
    host: 'localhost',
    user: 'patrick',
    password:'@vernom28_niyo',
    port: 3306,
    database: 'fimboEcommerceDb',
    insecureAuth : true
  }, 'single'));
 

  app.use('/utils/uploads/productsImages', express.static('utils/uploads/productsImages'));
  app.use('/utils/uploads/vendorsLogos', express.static('utils/uploads/vendorsLogos'));

  app.use('/utils/uploads/productsImages/:id',(req,res,next)=>{
      next();
  })

  app.use('/api/users',userController);
  app.use('/api/auth',authController)
  app.use('/api/productsCategories',productsCategories);
  app.use('/api/productsCollections',productsCollections);
  app.use('/api/productsMarks',productsMarks);
  app.use('/api/productsSellers',productsSellers);
  app.use('/api/products',products)
  app.use('/api/topDisplayDivisions',topDisplayDivisionsController)
  app.use('/api/productsRates',rateProductController)
  app.use('/api/shoppingCart',shoppingCartController)
  app.use('/api/emailVerification',emailVerificationController)
  app.use('/api/usersAddresses',usersAddresseController)
  app.use('/api/plans',planController);
  app.use('/api/orders',orderController);
  app.use('/api/foundOrders',foundOrdersController);
  app.use('/uploads', express.static('uploads'));
 
 var port = process.env.PORT || 3000

app.listen(port, ()=>{
    console.log("server running on "+port)
})


