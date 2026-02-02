import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    productName: {
        type: String   
    },
    price : {
        type: String
    },
},
{
    timestamps: true
}
)

export const Product = mongoose.model("Product", productSchema);