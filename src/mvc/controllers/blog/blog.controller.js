import {
  getBlogs,
  getBlog,
  getBlogBySlugService,
  createBlogService,
  updateBlogService,
  deleteBlogService
} from "../../services/blog/index.js";

const getBlogsController = async (req, res) => {
  try {
    const result = await getBlogs(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBlogController = async (req, res) => {
  try {
    const result = await getBlog(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBlogBySlugController = async (req, res) => {
  try {
    const result = await getBlogBySlugService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createBlogController = async (req, res) => {
  try {
    const result = await createBlogService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBlogController = async (req, res) => {
  try {
    const result = await updateBlogService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteBlogController = async (req, res) => {
  try {
    const result = await deleteBlogService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getBlogsController,
  getBlogController,
  getBlogBySlugController,
  createBlogController,
  updateBlogController,
  deleteBlogController
};

