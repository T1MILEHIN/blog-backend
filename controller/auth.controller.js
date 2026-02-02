import bcrypt from "bcryptjs";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

function generateToken(user, res) {
    const token = jwt.sign(
        { id: user._id, firstname: user.firstname, email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_DATE,
    }
    )
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export const registerUser = async (req, res) => {
    const { firstname, lastname, email, password } = req.body

    if (!firstname || !lastname || !email || !password) {
        return res.status(400).json({ message: "Please fill all your Details" })
    }

    try {
        const existingEmail = await User.findOne({ email });

        if (existingEmail) {
            return res.status(400).json({ message: "Email already taken" });
        }

        console.log(existingEmail)

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ firstname, lastname, email, password: hashedPassword })

        await newUser.save();

        generateToken(newUser, res);

        res.status(201).json({ message: "User registered Successfully", id: newUser._id, firstname: newUser.firstname, email: newUser.email });

    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log(email, password)

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill your Details" })
    }

    try {
        const user = await User.findOne({ email });

        console.log(user)

        if (!user) {
            return res.status(404).json({ message: "USer not found" });
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        console.log(checkPassword);

        if (checkPassword) {

            generateToken(user, res);

            res.status(200).json({ message: "Logged in Successfully", id: user._id, firstname: user.firstname, email: user.email, isAdmin : user.isAdmin });
        }
        else {
            res.status(404).json({ message: "Invalid credentials" })
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

export const logOutUser = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ message: "Logged out" });
}

export const isLoggedIn = (req, res) => {
    try {
        const token = req.headers.cookie;

        if (!token) {
            return res.json({ isAuthenticated: false, user: null });
        }

        const tokenValue = token.split('=')[1];

        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

        res.json({
            isAuthenticated: true,
            user: {
                _id: decoded._id,
                firstname: decoded.firstname,
                lastname: decoded.lastname,
                email: decoded.email,
                isAdmin: decoded.isAdmin
            }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        res.json({ isAuthenticated: false });
    }
}

