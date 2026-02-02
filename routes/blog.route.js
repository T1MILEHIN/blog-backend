import { Router } from "express";
import { createBlogPost, getBlogs, getBlogById, deleteBlogPost ,updateBlogPost } from "../controller/blog.controller.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.middleware.js";
// import { isLoggedIn } from "../controller/auth.controller.js";
import { isLoggedIn } from "../middleware/blog.middleware.js";

const blogRoute = Router();

blogRoute.get("/getAll", getBlogs);

blogRoute.get("/getById/:id", getBlogById);

blogRoute.post("/create", verifyToken, upload.array("images", 5), createBlogPost);


blogRoute.delete("/delete/:id", verifyToken, deleteBlogPost);


blogRoute.put("/update/:id", verifyToken, updateBlogPost);





export default blogRoute;