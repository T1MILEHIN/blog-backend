import { BlogPost } from "../model/blog.model.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

export const getBlogs = async (req, res) => {
    try {
        const { q } = req.query;

        console.log("Q", q);

        let filter = { status: "published" };

        if (q) {
            filter.$or = [
                { title: { $regex: q, $options: "i" } },
                { content: { $regex: q, $options: "i" } }
            ];
        }

        const posts = await BlogPost.find(filter)
            .populate("author", "firstname lastname email")
            .populate("categories", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: posts,
            loggedInUser: req.user,
        });
    } catch (error) {

        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await BlogPost.findById(id)
            .populate("author", "firstname lastname email")
            .populate("categories", "name");
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }

        post.views += 1;
        await post.save();
        
        res.status(200).json({
            success: true,
            data: post
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch blog post",
            error: error.message
        });
    }
}










export const createBlogPost = async(req, res)=> {
    try {
        console.log("REQ===>", req.body);
        const { title, content, status } = req.body;

        let tags = [];
        let categories = [];

        if (req.body.tags) {
            tags = JSON.parse(req.body.tags);
        }

        if (req.body.categories) {
            categories = JSON.parse(req.body.categories);
        }

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required",
            });
        }

        const uploadedImages = [];

        console.log("FILES", req.files);

        console.log(req.files);

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadBufferToCloudinary(file.buffer, {
                    folder: "blog_uploads",
                });
                
                uploadedImages.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        }

        const post = new BlogPost({
            title,
            content,
            status,
            images: uploadedImages,
            tags,
            categories,
            author: req.user._id,
            publishedAt: status === "published" ? new Date() : null
        });

        await post.save();

        res.status(201).json({
            success: true,
            message: "Blog post created successfully",
            data: post
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create blog post",
            error: error.message,
        });
    }
}



export const updateBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, status } = req.body;
        
        const post = await BlogPost.findById(id);

        console.log("post", post)
        console.log("user", req.user);
        

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }
        
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this post"
            });
        }
        
        let tags = [];
        let categories = [];
        
        if (req.body.tags) {
            tags = JSON.parse(req.body.tags);
        }
        
        if (req.body.categories) {
            categories = JSON.parse(req.body.categories);
        }
        
        const uploadedImages = [...post.images];
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await uploadBufferToCloudinary(file.buffer, {
                    folder: "blog_uploads",
                });
                
                uploadedImages.push({
                    url: result.secure_url,
                    public_id: result.public_id,
                });
            }
        }
        
        post.title = title || post.title;
        post.content = content || post.content;
        post.status = status || post.status;
        post.tags = tags.length > 0 ? tags : post.tags;
        post.categories = categories.length > 0 ? categories : post.categories;
        post.images = uploadedImages;
        
        if (status === "published" && post.status !== "published") {
            post.publishedAt = new Date();
        }
        
        await post.save();
        
        res.status(200).json({
            success: true,
            message: "Blog post updated successfully",
            data: post
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to update blog post",
            error: error.message
        });
    }
}


export const deleteBlogPost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await BlogPost.findById(id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Blog post not found"
            });
        }
        
        // Check if user is the author or admin
        if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this post"
            });
        }
        
        // Optional: Delete images from Cloudinary
        if (post.images && post.images.length > 0) {
            for (const image of post.images) {
                if (image.public_id) {
                    try {
                        await cloudinary.uploader.destroy(image.public_id);
                    } catch (error) {
                        console.error('Error deleting image from Cloudinary:', error);
                    }
                }
            }
        }
        
        // Delete the post
        await BlogPost.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: "Blog post deleted successfully"
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to delete blog post",
            error: error.message
        });
    }
}