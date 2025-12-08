import {
  createAnnouncement,
  getAnnouncementById,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from "../../database/db.announcement.js";

const getAnnouncements = async (req) => {
  try {
    const options = {
      isActive: req?.query?.isActive !== undefined ? req.query.isActive === 'true' : true
    };
    
    const announcements = await getAllAnnouncements(options);
    
    return {
      success: true,
      message: "Announcements fetched successfully",
      statusCode: 200,
      announcements: announcements
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const getAnnouncement = async (req) => {
  try {
    const { id } = req?.params;
    
    const announcement = await getAnnouncementById(id);
    
    if (!announcement) {
      return {
        success: false,
        message: "Announcement not found",
        statusCode: 404
      };
    }
    
    return {
      success: true,
      message: "Announcement fetched successfully",
      statusCode: 200,
      data: announcement
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const createAnnouncementService = async (req) => {
  try {
    const announcementData = req?.body;
    
    const announcement = await createAnnouncement(announcementData);
    
    return {
      success: true,
      message: "Announcement created successfully",
      statusCode: 201,
      data: announcement
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const updateAnnouncementService = async (req) => {
  try {
    const { id } = req?.params;
    const updateData = req?.body;
    
    const announcement = await updateAnnouncement(id, updateData);
    
    return {
      success: true,
      message: "Announcement updated successfully",
      statusCode: 200,
      data: announcement
    };
  } catch (error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message
    };
  }
};

const deleteAnnouncementService = async (req) => {
  try {
    const { id } = req?.params;
    
    await deleteAnnouncement(id);
    
    return {
      success: true,
      message: "Announcement deleted successfully",
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
  getAnnouncements,
  getAnnouncement,
  createAnnouncementService,
  updateAnnouncementService,
  deleteAnnouncementService
};

