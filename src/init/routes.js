import { userRouter } from "../mvc/routes/user/user.routes.js";
import uploadRouter from "../mvc/routes/upload/upload.routes.js";
import { authRouter } from "../mvc/routes/auth/auth.routes.js";
import { productRouter } from "../mvc/routes/product/product.routes.js";
import { categoryRouter } from "../mvc/routes/category/category.routes.js";
import { cartRouter } from "../mvc/routes/cart/cart.routes.js";
import { orderRouter } from "../mvc/routes/order/order.routes.js";
import { wishlistRouter } from "../mvc/routes/wishlist/wishlist.routes.js";
import { addressRouter } from "../mvc/routes/address/address.routes.js";
import { couponRouter } from "../mvc/routes/coupon/coupon.routes.js";
import { bannerRouter } from "../mvc/routes/banner/banner.routes.js";
import { reviewRouter } from "../mvc/routes/review/review.routes.js";
import { stockNotificationRouter } from "../mvc/routes/stockNotification/stockNotification.routes.js";
import { productQuestionRouter } from "../mvc/routes/productQuestion/productQuestion.routes.js";
import { notificationRouter } from "../mvc/routes/notification/notification.routes.js";
import { announcementRouter } from "../mvc/routes/announcement/announcement.routes.js";
import { blogRouter } from "../mvc/routes/blog/blog.routes.js";

export default(app)=>{
    // Auth routes
    app.use("/api/auth", authRouter);
    
    // User routes
    app.use("/api/users", userRouter);
    
    // Upload routes
    app.use("/api/upload", uploadRouter);
    
    // Ecommerce routes
    app.use("/api/products", productRouter);
    app.use("/api/categories", categoryRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/wishlist", wishlistRouter);
    app.use("/api/addresses", addressRouter);
    app.use("/api/coupons", couponRouter);
    app.use("/api/banners", bannerRouter);
    app.use("/api/reviews", reviewRouter);
    app.use("/api/stock-notifications", stockNotificationRouter);
    app.use("/api/product-questions", productQuestionRouter);
    app.use("/api/notifications", notificationRouter);
    app.use("/api/announcements", announcementRouter);
    app.use("/api/blogs", blogRouter);
}
