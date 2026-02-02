import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    userImage: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
},
{
    timestamps: true
}
)

export const User = mongoose.model("User", UserSchema);