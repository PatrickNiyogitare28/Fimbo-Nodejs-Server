require('dotenv').config();
const mysql = require('mysql');

try{
    module.exports.pool  = mysql.createPool({
        host     : process.env.PROD_HOST,
        user     : process.env.PROD_USERSNAME,
        password :  process.env.PROD_PASSWORD,
        database : process.env.PROD_DB
    });
    console.log("App connected to MYSQL DB")
}
catch(e){
    console.log("MYSQL connection error: "+e);
}

