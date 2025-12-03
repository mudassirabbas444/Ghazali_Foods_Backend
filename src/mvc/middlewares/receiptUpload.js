import multer from 'multer';

// Configure multer for memory storage (receipts)
const storage = multer.memoryStorage();

export const receiptUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and PDF files are allowed.'), false);
        }
    }
});

// Middleware for single receipt upload
export const uploadReceipt = receiptUpload.single('receipt');

