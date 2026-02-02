import { Router } from "express";
import { registerUser, loginUser, isLoggedIn, logOutUser } from "../controller/auth.controller.js";

const authRoute = Router();

authRoute.post("/register", registerUser); // auth/register/


authRoute.post("/login", loginUser); // auth/login/


authRoute.get("/check", isLoggedIn ) // auth/check/


authRoute.post("/logout", logOutUser ) // auth/logout/


export default authRoute;