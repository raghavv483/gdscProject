const  JWT= require( 'jsonwebtoken');
const  asyncHandler= require( '../utils/asyncHandler.js');
const  ApiError =require( '../utils/apiError.js');
const   User = require ("../models/user.js"); 

const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = JWT.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select(" -password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

module.exports=verifyJWT;
