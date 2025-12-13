import express from "express";
import blogController from "../../controllers/blog/blog.controller.js";
import { blogRoutes } from "../routes-strings.js";
import auth from "../../middlewares/auth.js";
import isAdmin from "../../middlewares/isAdmin.js";

const router = express.Router();

// Public routes
router.get(blogRoutes.GET_BLOGS, blogController.getBlogsController);
router.get(blogRoutes.GET_BLOG_BY_SLUG, blogController.getBlogBySlugController);
router.get(blogRoutes.GET_BLOG, blogController.getBlogController);

// Admin routes
router.post(blogRoutes.CREATE_BLOG, auth, isAdmin, blogController.createBlogController);
router.put(blogRoutes.UPDATE_BLOG, auth, isAdmin, blogController.updateBlogController);
router.delete(blogRoutes.DELETE_BLOG, auth, isAdmin, blogController.deleteBlogController);

export { router as blogRouter };

