import { uploadBufferToCloudinary } from "../config/cloudinary.js";

export const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder: "single_uploads",
        });

        res.json({
            message: "Upload successful",
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

export const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        const uploadedImages = [];

        for (const file of req.files) {
            const result = await uploadBufferToCloudinary(file.buffer, {
                folder: "multi_uploads",
            });

            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }

        res.json({
            message: "Upload successful",
            images: uploadedImages,
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};