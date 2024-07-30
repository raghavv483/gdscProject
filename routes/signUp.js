const express = require('express');  
const router = express.Router();  


const app = express();  
app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views"));  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

router.route("/"),get.((req,res)=>{
   res.render("signUp.ejs")
})


module.exports=router;
