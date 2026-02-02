import express from "express";
import url from 'url';
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { Product } from "./model/product.model.js";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import categoryRoute from "./routes/category.route.js";
import cors from "cors";

import { Category } from "./model/categories.model.js";


const app = express();

app.use(cors({
    origin: ["http://localhost:5173"]
}));

dotenv.config();

const PORT = 8000;

connectDB();

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json());


app.use("/auth", authRoute); // user authentication, authorization, register, login


app.use("/blog", blogRoute); //
app.use("/category", categoryRoute);

// app.use("/product", productRoute);


const filePath = path.join(__dirname, "public", "index.html");

app.get("/", (req, res)=> {
    res.sendFile(filePath)
});

app.get("/post", (req, res)=> {
    const filePath = path.join(__dirname, "public", "post.html");
    res.sendFile(filePath)
})

app.get("/update-post", (req, res)=> {
    const filePath = path.join(__dirname, "public", "updateblog.html");
    res.sendFile(filePath)
})

app.get("/admin", (req, res)=> {
    const filePath = path.join(__dirname, "public", "admin.html");
    res.sendFile(filePath)
})

app.get("/register", (req, res)=> {
    const filePath = path.join(__dirname, "public", "auth", "register.html");
    res.sendFile(filePath)
})

app.get("/error", (req, res)=> {
    const filePath = path.join(__dirname, "public", "404.html");
    res.sendFile(filePath)
})

app.get("/login", (req, res)=> {
    const filePath = path.join(__dirname, "public", "auth", "login.html");
    res.sendFile(filePath)
})


app.get("/all-products", async(req, res)=> {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: err.message
        });
    }
})

app.post("/add", async(req, res)=> {
    console.log(req.body)
    const { name, price } = req.body

    if (!name || !price) {
        res.status(400).json({message: "Input field empty"})
        return;
    }

    const newProduct = new Product({ productName: name, price: price});
    await newProduct.save()
    res.status(201).json({message: "Success"})
    console.log(newProduct)

})

app.put("/update-product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;

        const product = await Product.findByIdAndUpdate(
            id,
            { productName: name, price },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            success: true,
            message: "Product updated successfully",
            product
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, ()=> console.log("Server is running!!!!!"))