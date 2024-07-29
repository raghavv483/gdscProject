const mongoose=require("mongoose");
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const userSchema=mongoose.Schema({
    Project_name: {
        type: String,
        required: [true, 'Project_name is required'],
    },
    Github_url: {
        type: String,
        required: [true, 'Github_url is required'],
    },
    thumbnail: {
        type: {
            public_id: String,
            url: String
        },
        required: true
    },
   
    Live_hosted_link:{
        type:String,
    },
    TechStack_used:{
        type:String,
    },
},{
    timestamp:true
});

module.exports=mongoose.model("user",userSchema);