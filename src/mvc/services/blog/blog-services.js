import {
  createBlog,
  getBlogById,
  getBlogBySlug,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  incrementViews
} from "../../database/db.blog.js";

const getBlogs = async (req) => {
  try {
    const options = {
      isPublished: req?.query?.isPublished !== undefined ? req.query.isPublished === 'true' : undefined,
      category: req?.query?.category || undefined,
      search: req?.query?.search || undefined,
      tag: req?.query?.tag || undefined,
      page: req?.query?.page || 1,
      limit: req?.query?.limit || 10,
    };
    
    const result = await getAllBlogs(options);
    
    return {
      success: true,
      message: "Blogs fetched successfully",
      statusCode: 200,
      blogs: result.blogs,
      pagination: result.pagination
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getBlog = async (req) => {
  try {
    const { id } = req?.params;
    
    const blog = await getBlogById(id);
    
    if (!blog) {
      return {
        success: false,
        message: "Blog not found",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Blog fetched successfully",
      statusCode: 200,
      blog: blog
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getBlogBySlugService = async (req) => {
  try {
    const { slug } = req?.params;
    
    const blog = await getBlogBySlug(slug);
    
    if (!blog) {
      return {
        success: false,
        message: "Blog not found",
        statusCode: 404
      };
    }
    
    // Increment views for published blogs
    if (blog.isPublished) {
      await incrementViews(blog._id);
    }
    
    return {
      success: true,
      message: "Blog fetched successfully",
      statusCode: 200,
      blog: blog
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createBlogService = async (req) => {
  try {
    const blogData = { ...req?.body };
    
    // Parse JSON fields from FormData
    if (typeof blogData.tags === 'string') {
      try {
        blogData.tags = JSON.parse(blogData.tags);
      } catch (e) {
        blogData.tags = blogData.tags ? [blogData.tags] : [];
      }
    }
    
    // Handle image upload if provided
    if (req?.file) {
      const { uploadImage } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadImage(
        req.file.buffer,
        'blogs',
        req.user?.id,
        req.file.originalname
      );
      blogData.featuredImage = uploadResult.url;
    }
    
    // Convert string booleans to actual booleans
    if (typeof blogData.isPublished === 'string') {
      blogData.isPublished = blogData.isPublished === 'true' || blogData.isPublished === 'on';
    } else if (blogData.isPublished === undefined || blogData.isPublished === null) {
      blogData.isPublished = false;
    }
    
    // Set publishedAt if publishing
    if (blogData.isPublished) {
      blogData.publishedAt = new Date();
    }
    
    const blog = await createBlog(blogData);
    
    return {
      success: true,
      message: "Blog created successfully",
      statusCode: 201,
      blog: blog
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateBlogService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = { ...req?.body };
    
    // Parse JSON fields from FormData
    if (typeof updateData.tags === 'string') {
      try {
        updateData.tags = JSON.parse(updateData.tags);
      } catch (e) {
        updateData.tags = updateData.tags ? [updateData.tags] : [];
      }
    }
    
    // Handle image upload if provided
    if (req?.file) {
      const { uploadImage } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadImage(
        req.file.buffer,
        'blogs',
        req.user?.id,
        req.file.originalname
      );
      updateData.featuredImage = uploadResult.url;
    }
    
    // Convert string booleans to actual booleans
    if (typeof updateData.isPublished === 'string') {
      updateData.isPublished = updateData.isPublished === 'true' || updateData.isPublished === 'on';
    }
    
    // If publishing for the first time, set publishedAt
    if (updateData.isPublished) {
      const existingBlog = await getBlogById(id);
      if (!existingBlog?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    
    const blog = await updateBlog(id, updateData);
    
    return {
      success: true,
      message: "Blog updated successfully",
      statusCode: 200,
      blog: blog
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteBlogService = async (req) => {
  try {
    const { id } = req?.params;
    
    await deleteBlog(id);
    
    return {
      success: true,
      message: "Blog deleted successfully",
      statusCode: 200
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

export default {
  getBlogs,
  getBlog,
  getBlogBySlugService,
  createBlogService,
  updateBlogService,
  deleteBlogService
};

