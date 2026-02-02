import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";


export const authMiddleware = async(req,res,next) => {
    console.log(req.cookies);
    const { token } = req.cookies;

    
    if(!token){
        return res.status(401).json({success: false, message: "Not Authorized, Login Again"});
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokenDecode.id){
            req.body.id = tokenDecode.id;
        }
        else{
            return res.status(401).json({success: false, message: 'Not Authorized, Login Again'});
        }
        next();
    } catch (error) {
        res.status(400).json({success: false, message: error.message});
    }
}


export const verifyToken = async (req, res, next) => {
    try {
        const cookieHeader = req.headers.cookie;
        console.log(cookieHeader);
        
        if (!cookieHeader) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const token = cookieHeader
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user and attach to request
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};




export const isAuthorOrAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const post = await BlogPost.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }
        
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action"
            });
        }
        
        req.post = post;
        next();
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Authorization check failed",
            error: error.message
        });
    }
}