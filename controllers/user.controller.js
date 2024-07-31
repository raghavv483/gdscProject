const express = require('express');  
const router = express.Router();  

const User=require("../models/user")

const JWT=require("jsonwebtoken");
const mongoose=require("mongoose");
const generateAccessAndRefreshToken = async(userId) => {

    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token.");
    }
};

const signupUser = async function(req, res, next) {  
    console.log("ji")
    try {  
        const { email, fullName, password, thumbnail } = req.body;
        if ([email, fullName, password].some(field => field?.trim() === "")) {  
            return res.status(400).json({ error: "All fields are required" });  
        }   
        const userExists = await User.findOne({ email });  
        if (userExists) {  
            return res.status(409).json({ error: "User with this email already exists" });  
        }  
        const hashedPassword = await bcrypt.hash(password, 10);  

        const user = await User.create({  
            fullName,  
            thumbnail: {  
                public_id: thumbnail?.public_id, 
                url: thumbnail?.secure_url  
            },  
            email,  
            password: hashedPassword 
        });  

        const createdUser = await User.findById(user._id).select("-password -refreshToken");  
        if (!createdUser) {  
            return res.status(500).json({ error: "User registration failed, please try again" });  
        }  
        return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));    
    } catch (error) {  
        console.error("Registration error:", error);  
        return res.status(500).json({ error: "An unexpected error occurred" });  
    }  
};
const login=async (req,res)=>{
    const{email,password}=req.body;
    if(!email||!password){
        throw new Error("something went wrong");
    }
    const user = await User.findOne(email)
    if(!user){
        throw new Error("something went wrong");
    }
    const isPassword=await user.comparePassword(password);
    if(!isPassword){
        throw new Error("something went wrong");
    }
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id);
    const loggedUser= await User.findById(user._id).select(" -password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new Response(
                200,
                {
                    user: loggedUser, accessToken, refreshToken
                },
                "User logged in successfully !!!."
            )
        );
}
const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // removes field from document
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logout successfull !!!."
            )
        );
};

module.exports={logoutUser,signupUser,login};
