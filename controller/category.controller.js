import { Category } from "../model/categories.model.js";

export const createCategory = async(req, res)=> {
    try {
        const { name } = req.body;
        console.log("name", name);

        const existingcategory = await Category.findOne({ name });

        console.log("existing category", existingcategory);

        if (existingcategory) {
            return res.status(400).json({message: "Category Already Exists"})
        }

        const newCategory = await new Category({ name });
        console.log("new", newCategory)

        await newCategory.save()

        res.status(201).json({message: "category successfully added!!"})
        
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

export const getCategories = async(req, res) => {
    try {
        const categories = await Category.find();
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
            error: error.message
        });
    }
}
