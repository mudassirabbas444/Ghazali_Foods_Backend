import Announcement from "../models/Announcement.js";
import { ensureConnection } from '../../utils/waitForConnection.js';

export const createAnnouncement = async (announcementData) => {
  try {
    await ensureConnection();
    const announcement = new Announcement(announcementData);
    return await announcement.save();
  } catch (error) {
    throw new Error("Error creating announcement: " + error.message);
  }
};

export const getAnnouncementById = async (announcementId) => {
  try {
    await ensureConnection();
    return await Announcement.findById(announcementId);
  } catch (error) {
    throw new Error("Error fetching announcement: " + error.message);
  }
};

export const getAllAnnouncements = async (options = {}) => {
  try {
    await ensureConnection();
    const query = {};
    
    if (options.isActive !== undefined) {
      query.isActive = options.isActive;
    }
    
    // Filter by date range if provided
    const now = new Date();
    query.$or = [
      { startDate: null, endDate: null },
      {
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
        ]
      }
    ];
    
    const announcements = await Announcement.find(query)
      .sort({ displayOrder: 1, createdAt: -1 });
    
    return announcements;
  } catch (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
};

export const updateAnnouncement = async (announcementId, updateData) => {
  try {
    await ensureConnection();
    const announcement = await Announcement.findByIdAndUpdate(announcementId, updateData, { new: true });
    if (!announcement) {
      throw new Error("Announcement not found");
    }
    return announcement;
  } catch (error) {
    throw new Error("Error updating announcement: " + error.message);
  }
};

export const deleteAnnouncement = async (announcementId) => {
  try {
    await ensureConnection();
    const announcement = await Announcement.findByIdAndDelete(announcementId);
    if (!announcement) {
      throw new Error("Announcement not found");
    }
    return announcement;
  } catch (error) {
    throw new Error("Error deleting announcement: " + error.message);
  }
};

