import Banner from "../models/Banner.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createBanner = async (bannerData) => {
  try {
    await ensureConnection();
    const banner = new Banner(bannerData);
    return await banner.save();
  } catch (error) {
    throw new Error("Error creating banner: " + error.message);
  }
};

export const getBannerById = async (bannerId) => {
  try {
    await ensureConnection();
    return await Banner.findById(bannerId);
  } catch (error) {
    throw new Error("Error fetching banner: " + error.message);
  }
};

export const getAllBanners = async (options = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (options.position) {
      query.position = options.position;
    }
    
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    }
    
    // Filter by date range if provided
    if (options.startDate || options.endDate) {
      query.$or = [
        { startDate: null, endDate: null },
        {
          $and: [
            { $or: [{ startDate: null }, { startDate: { $lte: new Date() } }] },
            { $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] }
          ]
        }
      ];
    }
    
    const banners = await Banner.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });
    
    return banners;
  } catch (error) {
    throw new Error("Error fetching banners: " + error.message);
  }
};

export const updateBanner = async (bannerId, updateData) => {
  try {
    await ensureConnection();
    const banner = await Banner.findByIdAndUpdate(bannerId, updateData, { new: true });
    if (!banner) {
      throw new Error("Banner not found");
    }
    return banner;
  } catch (error) {
    throw new Error("Error updating banner: " + error.message);
  }
};

export const deleteBanner = async (bannerId) => {
  try {
    await ensureConnection();
    const banner = await Banner.findByIdAndDelete(bannerId);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return banner;
  } catch (error) {
    throw new Error("Error deleting banner: " + error.message);
  }
};

