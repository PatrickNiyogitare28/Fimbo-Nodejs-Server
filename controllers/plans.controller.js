const express = require('express');
const {validatePlan,updatePlanValidator} = require('../utils/validators/plan.validator');
const adminMiddleWare = require('../middlewares/admin');
const router = express.Router();
const {pool} = require('../models/db');


router.post('/newPlan',[adminMiddleWare],(req,res)=>{
 const newPlan = req.body;   
 const {error} = validatePlan(newPlan);
 if(error) return res.send({success: false, status: 400, message: error.details[0].message}).status(400);
 pool.getConnection((err,conn)=>{
     if(err){ return res.send({success: false, status: 500, message: err}).status(500)}
     conn.query('INSERT INTO plans SET ?',[newPlan],(err,isCreated)=>{
      if(err){return res.send({success: false, status: 400, message: err}).status(400)}
      else{
          res.send({success: true, status: 201, message: "Plan created",isCreated: isCreated}).status(201)
      }
     })
 })
})
router.get('/availablePlans',(req,res)=>{
   pool.getConnection((err,conn)=>{
    if(err){ return res.send({success: false, status: 500, message: err}).status(500)}
    conn.query('SELECT * FROM plans ORDER BY `plan_id` ASC',(err,plans)=>{
      if(err){return res.send({success: false, status: 400, message: err}).status(400)}
      else{
          res.send({success: false,status: 200, plans: plans}).status(200)
      }
    })
   })
})
router.get('/:planId',(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err){ return res.send({success: false, status: 500, message: err}).status(500)}
        conn.query('SELECT * FROM plans WHERE plan_id = ?',[req.params.planId],(err,plan)=>{
          if(err){return res.send({success: false, status: 400, message: err}).status(400)}
          else if(plan.length == 0){
              return res.send({success:false, status: 404, message:"Plan not found"}).status(404)
          }
          else if(plan.length == 1){
              res.send({success: false,status: 200, plan:plan}).status(200)
          }
          else{ return res.send({success: false, status: 400, message: "An error occured"}).status(400)}
        })
    })
})
router.delete('/removePlan/:planId',[adminMiddleWare],(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err){ return res.send({success: false, status: 500, message: err}).status(500)}
        conn.query('SELECT * FROM plans WHERE plan_id = ?',[req.params.planId],(err,planValid)=>{
            if(err){return res.send({success: false, status: 400, message: err}).status(400)}
            else if(planValid.length == 0){
                return res.send({success: false, status: 404, message: "Plan not found"}).status(400)
            }
            else if(planValid.length == 1){
                conn.query('DELETE FROM plans WHERE plan_id = ?',[req.params.planId],(err,planRemoved)=>{
                    if(err){ return res.send({successs: false, status: 400, message: err}).status(400)}
                    else{
                        return res.send({success: false, status: 200, message: "Plan Removed"}).status(200)
                    }
                })
            }
            else{
                return res.send({success: false,status: 400, message: "An error occured"}).status(400)
            }
        })    
        })   
})
router.put('/updatePlan',[adminMiddleWare],(req,res)=>{
    const {error} = updatePlanValidator(req.body);
    if(error){ return res.send({success: false, status: 400, message: error.details[0].message}).status(400)}
    const updatedPlan = {
        plan_name: req.body.plan_name,
        price: req.body.price,
        description: req.body.description,
        max_products: req.body.max_products
    } 
    pool.getConnection((err,conn)=>{
    if(err){ return res.send({success: false, status: 500, message: err}).status(500)}
    conn.query('SELECT * FROM plans WHERE plan_id = ?',[req.body.planId],(err,planValid)=>{
        if(err){return res.send({success: false, status: 400, message: err}).status(400)}
        else if(planValid.length == 0){
            return res.send({success: false, status: 404, message: "Plan not found"}).status(400)
        }
        else if(planValid.length == 1){
            conn.query('UPDATE plans SET ? WHERE plan_id = ?',[updatedPlan,req.body.planId],(err,planUpdated)=>{
                if(err){ return res.send({successs: false, status: 400, message: err}).status(400)}
                else{
                    return res.send({success: true, status: 200, message: "Plan updated"}).status(200)
                }
            })
        }
        else{
            return res.send({success: false,status: 400, message: "An error occured"}).status(400)
        }
    })    
    })
})
module.exports = router;