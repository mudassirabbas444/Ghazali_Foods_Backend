import blogServices from "./blog-services.js";

export const {
  getBlogs,
  getBlog,
  getBlogBySlugService,
  createBlogService,
  updateBlogService,
  deleteBlogService
} = blogServices;

