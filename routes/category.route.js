import { Router } from "express";
import { createCategory, getCategories } from "../controller/category.controller.js";

const categoryRoute = Router();

categoryRoute.post("/", createCategory);
categoryRoute.get("/getAll", getCategories);
// categoryRoute.post("/", createCategory);
// categoryRoute.post("/:name", createCategory);

export default categoryRoute;