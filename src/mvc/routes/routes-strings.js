
export const authRoutes = {
    REGISTER: "/register",
    LOGIN: "/login",
}

export const userRoutes = {
    REGISTER_USER: "/register",
    LOGIN_USER: "/login",
    GET_USER_PROFILE: "/profile",
    UPDATE_USER_PROFILE: "/update-profile",
    CHANGE_PASSWORD: "/change-password",
    GET_ALL_USERS: "/",
    DELETE_USER: "/delete-user",
    VERIFY_OTP: "/verify-otp",
    RESEND_OTP: "/resend-otp",
    GOOGLE_AUTH: "/google-auth",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
}

export const productRoutes = {
    GET_PRODUCTS: "/",
    GET_PRODUCT: "/:id",
    GET_PRODUCT_BY_SLUG: "/slug/:slug",
    CREATE_PRODUCT: "/",
    UPDATE_PRODUCT: "/:id",
    DELETE_PRODUCT: "/:id",
    GET_FEATURED: "/featured",
    GET_BEST_SELLERS: "/bestsellers",
    GET_NEW_ARRIVALS: "/new-arrivals",
    UPDATE_STOCK: "/:id/stock",
    GET_LOW_STOCK: "/low-stock",
}

export const categoryRoutes = {
    GET_CATEGORIES: "/",
    GET_CATEGORY: "/:id",
    GET_CATEGORY_BY_SLUG: "/slug/:slug",
    CREATE_CATEGORY: "/",
    UPDATE_CATEGORY: "/:id",
    DELETE_CATEGORY: "/:id",
}

export const cartRoutes = {
    GET_CART: "/",
    ADD_TO_CART: "/",
    UPDATE_CART_ITEM: "/item/:itemId",
    REMOVE_FROM_CART: "/item/:itemId",
    CLEAR_CART: "/",
    APPLY_COUPON: "/coupon",
    REMOVE_COUPON: "/coupon",
}

export const orderRoutes = {
    CREATE_ORDER: "/",
    GET_ORDER: "/:id",
    GET_ORDER_BY_NUMBER: "/number/:orderNumber",
    GET_USER_ORDERS: "/my-orders",
    GET_ALL_ORDERS: "/",
    UPDATE_ORDER_STATUS: "/:id/status",
    CANCEL_ORDER: "/:id/cancel",
    GET_ORDER_STATS: "/stats",
}

export const wishlistRoutes = {
    GET_WISHLIST: "/",
    ADD_TO_WISHLIST: "/",
    REMOVE_FROM_WISHLIST: "/:productId",
    CHECK_WISHLIST: "/check/:productId",
}

export const addressRoutes = {
    GET_ADDRESSES: "/",
    GET_ADDRESS: "/:id",
    CREATE_ADDRESS: "/",
    UPDATE_ADDRESS: "/:id",
    DELETE_ADDRESS: "/:id",
    GET_DEFAULT_ADDRESS: "/default",
}

export const couponRoutes = {
    GET_COUPONS: "/",
    GET_COUPON: "/:id",
    CREATE_COUPON: "/",
    UPDATE_COUPON: "/:id",
    DELETE_COUPON: "/:id",
    VALIDATE_COUPON: "/validate",
}

export const bannerRoutes = {
    GET_BANNERS: "/",
    GET_BANNER: "/:id",
    CREATE_BANNER: "/",
    UPDATE_BANNER: "/:id",
    DELETE_BANNER: "/:id",
}

export const reviewRoutes = {
    GET_REVIEWS: "/product/:productId",
    GET_ALL_REVIEWS: "/",
    GET_USER_REVIEWS: "/my-reviews",
    CREATE_REVIEW: "/",
    UPDATE_REVIEW: "/:id",
    DELETE_REVIEW: "/:id",
    APPROVE_REVIEW: "/:id/approve",
}

export const stockNotificationRoutes = {
    SUBSCRIBE: "/",
    GET_USER_NOTIFICATIONS: "/my-notifications",
    GET_ALL_NOTIFICATIONS: "/",
    UNSUBSCRIBE: "/:id",
}

export const productQuestionRoutes = {
    CREATE_QUESTION: "/",
    GET_PRODUCT_QUESTIONS: "/product/:productId",
    GET_USER_QUESTIONS: "/my-questions",
    GET_ALL_QUESTIONS: "/",
    ANSWER_QUESTION: "/:id/answer",
    UPDATE_QUESTION: "/:id",
    DELETE_QUESTION: "/:id",
    APPROVE_QUESTION: "/:id/approve",
    MARK_HELPFUL: "/:id/helpful",
}

export const notificationRoutes = {
    CREATE: "/",
    GET_USER_NOTIFICATIONS: "/",
    GET_UNREAD_COUNT: "/unread-count",
    MARK_AS_READ: "/:id/read",
    MARK_ALL_AS_READ: "/read-all",
    UPDATE: "/:id",
    DELETE: "/:id",
    DELETE_ALL: "/",
    DELETE_READ: "/read",
    GET_ALL: "/all", // Admin only
    CREATE_BULK: "/bulk", // Admin only
    CLEANUP: "/cleanup", // Admin only
}

export const announcementRoutes = {
    GET_ANNOUNCEMENTS: "/",
    GET_ANNOUNCEMENT: "/:id",
    CREATE_ANNOUNCEMENT: "/",
    UPDATE_ANNOUNCEMENT: "/:id",
    DELETE_ANNOUNCEMENT: "/:id",
}

export const blogRoutes = {
    GET_BLOGS: "/",
    GET_BLOG: "/:id",
    GET_BLOG_BY_SLUG: "/slug/:slug",
    CREATE_BLOG: "/",
    UPDATE_BLOG: "/:id",
    DELETE_BLOG: "/:id",
}


