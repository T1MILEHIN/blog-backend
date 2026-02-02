import jwt from "jsonwebtoken";
import { User } from "../model/user.model.js";

export const isLoggedIn = async (req, res, next) => {
    try {
        const cookieHeader = req?.headers?.cookie;

        console.log("cookie header", cookieHeader);

        const token = cookieHeader.split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        if (!token) {
            req.user = null;
            return next();
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user and attach to request
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            req.user = null;
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
}