/**
 * Email template helper functions
 * Centralized email templates with consistent branding
 */

const WEBSITE_NAME = "Ghazali Foods";
const ADMIN_EMAIL = "ghazalifood.has@gmail.com";

/**
 * Generate order confirmation email HTML
 */
export const generateOrderConfirmationEmail = (order, user) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong>
        ${item.variant ? `<br><small style="color: #666;">Variant: ${item.variant}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${WEBSITE_NAME}</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Confirmation</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hello ${user.fullName || user.email},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for your order! Your order <strong>${order.orderNumber}</strong> has been placed successfully.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Subtotal:</span>
              <span style="font-weight: bold;">Rs. ${order.subtotal.toFixed(2)}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #28a745;">
              <span>Discount:</span>
              <span>- Rs. ${order.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #666;">Delivery Charges:</span>
              <span style="font-weight: bold;">Rs. ${order.deliveryCharges.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 1px solid #ddd; font-size: 18px;">
              <span style="font-weight: bold; color: #333;">Total:</span>
              <span style="font-weight: bold; color: #667eea; font-size: 20px;">Rs. ${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.phone}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}${order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}<br>
            ${order.shippingAddress.postalCode ? `Postal Code: ${order.shippingAddress.postalCode}` : ''}
            ${order.shippingAddress.landmark ? `<br>Landmark: ${order.shippingAddress.landmark}` : ''}
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Payment Information</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}<br>
            <strong>Order Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          We'll notify you once your order is shipped. You can track your order status in your account.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message. Please do not reply to this email.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate order status update email HTML
 */
export const generateOrderStatusUpdateEmail = (order, user, previousStatus = null) => {
  const statusMessages = {
    pending: "Your order is pending and will be processed soon.",
    processing: "Your order is being processed and prepared for shipment.",
    packed: "Your order has been packed and is ready for delivery.",
    out_for_delivery: "Your order is out for delivery and will arrive soon!",
    delivered: "Your order has been delivered successfully. Thank you for shopping with us!",
    cancelled: "Your order has been cancelled.",
    returned: "Your order has been returned."
  };

  const statusMessage = statusMessages[order.status] || "Your order status has been updated.";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${WEBSITE_NAME}</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Status Update</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hello ${user.fullName || user.email},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Your order <strong>${order.orderNumber}</strong> status has been updated.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <h3 style="color: #333; margin-top: 0;">Current Status</h3>
          <div style="background: #667eea; color: white; padding: 15px; border-radius: 5px; display: inline-block; font-size: 18px; font-weight: bold; margin: 10px 0;">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
          </div>
          <p style="color: #666; line-height: 1.6; margin-top: 15px;">
            ${statusMessage}
          </p>
        </div>
        
        ${order.trackingNumber ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Tracking Information</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Tracking Number:</strong> ${order.trackingNumber}
          </p>
        </div>
        ` : ''}
        
        ${order.adminNotes ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; line-height: 1.6; margin: 0;">
            <strong>Note:</strong> ${order.adminNotes}
          </p>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Total Amount:</strong> Rs. ${order.total.toFixed(2)}<br>
            <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated message. Please do not reply to this email.<br>
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate admin notification email HTML for new order
 */
export const generateAdminOrderNotificationEmail = (order, user) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.productName}</strong>
        ${item.variant ? `<br><small style="color: #666;">Variant: ${item.variant}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.total.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${WEBSITE_NAME}</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">New Order Notification</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">New Order Received</h2>
        
        <p style="color: #666; line-height: 1.6;">
          A new order <strong>${order.orderNumber}</strong> has been placed and requires your attention.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Product</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
            <div style="display: flex; justify-content: space-between; padding-top: 10px; font-size: 18px;">
              <span style="font-weight: bold; color: #333;">Total Amount:</span>
              <span style="font-weight: bold; color: #dc3545; font-size: 20px;">Rs. ${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Customer Information</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Name:</strong> ${user.fullName || 'N/A'}<br>
            <strong>Email:</strong> ${user.email || 'N/A'}<br>
            <strong>Phone:</strong> ${user.phone || order.shippingAddress.phone || 'N/A'}
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Shipping Address</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${order.shippingAddress.fullName}<br>
            ${order.shippingAddress.phone}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}${order.shippingAddress.area ? `, ${order.shippingAddress.area}` : ''}<br>
            ${order.shippingAddress.postalCode ? `Postal Code: ${order.shippingAddress.postalCode}` : ''}
            ${order.shippingAddress.landmark ? `<br>Landmark: ${order.shippingAddress.landmark}` : ''}
          </p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Payment Information</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
            <strong>Payment Status:</strong> ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}<br>
            <strong>Order Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Please process this order as soon as possible.
        </p>
      </div>
    </div>
  `;
};

/**
 * Generate admin notification email HTML for order status change
 */
export const generateAdminOrderStatusUpdateEmail = (order, user, previousStatus = null) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${WEBSITE_NAME}</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Order Status Update</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Order Status Updated</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Order <strong>${order.orderNumber}</strong> status has been updated.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Status Information</h3>
          <p style="color: #666; line-height: 1.6; margin: 0;">
            ${previousStatus ? `<strong>Previous Status:</strong> ${previousStatus.charAt(0).toUpperCase() + previousStatus.slice(1).replace('_', ' ')}<br>` : ''}
            <strong>Current Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}<br>
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Customer:</strong> ${user.fullName || user.email}<br>
            <strong>Total Amount:</strong> Rs. ${order.total.toFixed(2)}
          </p>
        </div>
        
        ${order.adminNotes ? `
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <p style="color: #856404; line-height: 1.6; margin: 0;">
            <strong>Admin Notes:</strong> ${order.adminNotes}
          </p>
        </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated notification.
        </p>
      </div>
    </div>
  `;
};

export { WEBSITE_NAME, ADMIN_EMAIL };

