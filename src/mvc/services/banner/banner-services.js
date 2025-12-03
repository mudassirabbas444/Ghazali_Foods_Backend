import {
  createBanner,
  getBannerById,
  getAllBanners,
  updateBanner,
  deleteBanner
} from "../../database/db.banner.js";

const getBanners = async (req) => {
  try {
    const options = {
      position: req?.query?.position,
      isActive: req?.query?.isActive !== undefined ? req.query.isActive === 'true' : true
    };
    
    const banners = await getAllBanners(options);
    
    return {
      success: true,
      message: "Banners fetched successfully",
      statusCode: 200,
      banners: banners
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getBanner = async (req) => {
  try {
    const { id } = req?.params;
    
    const banner = await getBannerById(id);
    
    if (!banner) {
      return {
        success: false,
        message: "Banner not found",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Banner fetched successfully",
      statusCode: 200,
      data: banner
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createBannerService = async (req) => {
  try {
    const bannerData = req?.body;
    
    // Handle image upload if provided
    if (req?.file) {
      const { uploadImage } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadImage(
        req.file.buffer,
        'banners',
        req.user?.id,
        req.file.originalname
      );
      bannerData.image = uploadResult.url;
    }
    
    const banner = await createBanner(bannerData);
    
    return {
      success: true,
      message: "Banner created successfully",
      statusCode: 201,
      data: banner
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateBannerService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    // Handle image upload if provided
    if (req?.file) {
      const { uploadImage } = await import("../../../services/uploadService.js");
      const uploadResult = await uploadImage(
        req.file.buffer,
        'banners',
        req.user?.id,
        req.file.originalname
      );
      updateData.image = uploadResult.url;
    }
    
    const banner = await updateBanner(id, updateData);
    
    return {
      success: true,
      message: "Banner updated successfully",
      statusCode: 200,
      data: banner
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteBannerService = async (req) => {
  try {
    const { id } = req?.params;
    
    await deleteBanner(id);
    
    return {
      success: true,
      message: "Banner deleted successfully",
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
  getBanners,
  getBanner,
  createBannerService,
  updateBannerService,
  deleteBannerService
};

