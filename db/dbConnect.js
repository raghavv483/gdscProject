import mongoose from "mongoose";
const connect = async ()=>{
    try{
        const response=await mongoose.connect(`${process.env.MONGOURL}`)
        console.log("Mongo connected");
    }
    catch{
        console.log("mongo connection failed errror");
        process.exit(1);
    }
}