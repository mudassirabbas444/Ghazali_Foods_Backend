import {
  getBanners,
  getBanner,
  createBannerService,
  updateBannerService,
  deleteBannerService
} from "../../services/banner/index.js";

const getBannersController = async (req, res) => {
  try {
    const result = await getBanners(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getBannerController = async (req, res) => {
  try {
    const result = await getBanner(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createBannerController = async (req, res) => {
  try {
    const result = await createBannerService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateBannerController = async (req, res) => {
  try {
    const result = await updateBannerService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteBannerController = async (req, res) => {
  try {
    const result = await deleteBannerService(req);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export default {
  getBannersController,
  getBannerController,
  createBannerController,
  updateBannerController,
  deleteBannerController
};

