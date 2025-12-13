import Blog from "../models/Blog.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createBlog = async (blogData) => {
  try {
    await ensureConnection();
    const blog = new Blog(blogData);
    return await blog.save();
  } catch (error) {
    throw new Error("Error creating blog: " + error.message);
  }
};

export const getBlogById = async (blogId) => {
  try {
    await ensureConnection();
    return await Blog.findById(blogId);
  } catch (error) {
    throw new Error("Error fetching blog: " + error.message);
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    await ensureConnection();
    return await Blog.findOne({ slug });
  } catch (error) {
    throw new Error("Error fetching blog by slug: " + error.message);
  }
};

export const getAllBlogs = async (options = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (options.isPublished !== undefined) {
      query.isPublished = options.isPublished;
    }
    
    if (options.category) {
      query.category = options.category;
    }
    
    if (options.search) {
      query.$or = [
        { title: { $regex: options.search, $options: 'i' } },
        { content: { $regex: options.search, $options: 'i' } },
        { excerpt: { $regex: options.search, $options: 'i' } },
      ];
    }
    
    if (options.tag) {
      query.tags = { $in: [options.tag] };
    }
    
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    
    const blogs = await Blog.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Blog.countDocuments(query);
    
    return {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error("Error fetching blogs: " + error.message);
  }
};

export const updateBlog = async (blogId, blogData) => {
  try {
    await ensureConnection();
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: blogData },
      { new: true, runValidators: true }
    );
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  } catch (error) {
    throw new Error("Error updating blog: " + error.message);
  }
};

export const deleteBlog = async (blogId) => {
  try {
    await ensureConnection();
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }
    return blog;
  } catch (error) {
    throw new Error("Error deleting blog: " + error.message);
  }
};

export const incrementViews = async (blogId) => {
  try {
    await ensureConnection();
    return await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { views: 1 } },
      { new: true }
    );
  } catch (error) {
    throw new Error("Error incrementing views: " + error.message);
  }
};

