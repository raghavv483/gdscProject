const express=require("express");
const app=express();
const path=require("path");
require('./routes/projectRoutes');


app.set("view engine", "ejs");  
app.set("views", path.join(__dirname, "views"));  
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(express.static(path.join(__dirname, 'public')));




const port=3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});
