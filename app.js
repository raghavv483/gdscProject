const express=require("express");
const app=express();





app.use("/",require("./routes/projectRoutes"));
app.use("/",require("./routes/loginRoute"));



const port=3000;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
});