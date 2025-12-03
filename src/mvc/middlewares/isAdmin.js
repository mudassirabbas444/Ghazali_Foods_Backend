import User from "../models/User.js";

const isAdmin = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id || req?.user?.userId;
    
    if (!userId) {
      console.error('isAdmin middleware: No user ID found in req.user:', req.user);
      return res.status(401).json({ success: false, message: "Unauthorized - No user ID" });
    }

    const user = await User.findById(userId).select("isAdmin");
    if (!user) {
      console.error('isAdmin middleware: User not found with ID:', userId);
      return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
    }

    if (!user.isAdmin) {
      console.error('isAdmin middleware: User is not admin. User ID:', userId, 'isAdmin:', user.isAdmin);
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: Admin privileges required" 
      });
    }

    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default isAdmin;


