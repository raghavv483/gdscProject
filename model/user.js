const mongoose=require("mongoose");
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const userSchema=mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: [true, 'fullname is required'],
        trim: true,
        index: true
    },
    password: {
        type:String,
        required: [true, 'password is required'],
    },
    refresh_token:{
        type:String,

    }
},{
    timestamp:true
});
userSchema.pre("save",async()=>{
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    return next();
})

userSchema.methods = {
    comparePassword: async function(plainTextPassword) {
        return await bcrypt.compare(plainTextPassword, this.password)
    },
    generateAccessToken: function(){
    return jwt.sign(
        {
        _id: this._id,
        email:this.email,
        fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
},
    generateRefreshToken: function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
},
}

export const User = model('User', userSchema)