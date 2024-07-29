const express = require('express');  
const router = express.Router();  
import { User } from '../model/user';
import JWT from "jsonwebtoken"
import mongoose from 'mongoose'
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

const signupUser= async function(req,res){
    const {email, fullName, password} = req.body

    if ([email, fullName, password].some(
        (field) => ( field?.trim() === "" )
    )) {
        throw new ApiError(400, "All fields are required")
    }

    const userExists = await User.findOne({
        $or: [{ email }]
    })

    if (userExists) throw new ApiError(409, "user with username or email already exists")

    // console.log("req.files", req.files);
    const thumbnailLocalpath = req.files?.thumbnail[0]?.path
    // console.log("thumbnailLocalpath", thumbnailLocalpath);

    if (!thumbnailLocalpath) throw new ApiError(400, "thumbnail file is required")

    const thumbnail= await uploadOnCloudinary(thumbnailLocalpath).catch((error) => console.log(error))

    if (!thumbnail) throw new ApiError(400, "thumbnail file is required!!!.")

    const user = await User.create({
        fullName,
        thumbnail: {
            public_id: thumbnail.public_id,
            url: thumbnail.secure_url
        },
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500, "user registration failed, please try again")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
    
}
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

module.exports=router;