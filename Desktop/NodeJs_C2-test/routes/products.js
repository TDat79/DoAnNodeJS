const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { check_authentication, check_authorization } = require('../Utils/check_auth');
const multer = require('multer');
const path = require('path');

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // giới hạn 5MB
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
    }
});

// Routes công khai
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Routes yêu cầu quyền admin
router.post('/', 
    check_authentication, 
    check_authorization(['ADMIN']),
    upload.array('images', 5),
    productController.createProduct
);

router.put('/:id', 
    check_authentication, 
    check_authorization(['ADMIN']),
    upload.array('images', 5),
    productController.updateProduct
);

router.delete('/:id', 
    check_authentication, 
    check_authorization(['ADMIN']), 
    productController.deleteProduct
);

router.post('/:id/restore', 
    check_authentication, 
    check_authorization(['ADMIN']), 
    productController.restoreProduct
);

router.get('/admin/deleted', 
    check_authentication, 
    check_authorization(['ADMIN']), 
    productController.getDeletedProducts
);

module.exports = router;
