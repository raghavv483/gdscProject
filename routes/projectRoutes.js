const express = require('express');  
const router = express.Router();  


router.post("/project/create",(req,res)=>{
    res.send("")
})

router.route("/project/list").get((req,res)=>{
        res.send("hi");
})

router.route("/project/update/:project_id").put((req,res)=>{
    const project_id=req.params.project_id;
    res.send(`hi project ${project_id}`);
})

router.route("/project/delete/:project_id").delete((req,res)=>{
    const project_id=req.params.project_id;
})

module.exports=router;