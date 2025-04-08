const Product = require('../models/products');
const Category = require('../models/categories');

const productController = {
    // Lấy danh sách sản phẩm với filter và pagination
    getAllProducts: async (req, res) => {
        try {
            const { 
                page = 1, 
                limit = 10, 
                category, 
                minPrice, 
                maxPrice, 
                search,
                sort = 'createdAt',
                order = 'desc'
            } = req.query;

            const query = { isDeleted: false };

            if (category) {
                query.categoryID = category;
            }

            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }

            if (search) {
                query.$or = [
                    { productName: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const products = await Product.find(query)
                .populate('categoryID', 'categoryName description')
                .sort({ [sort]: order === 'desc' ? -1 : 1 })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec();

            const count = await Product.countDocuments(query);

            // Format lại response để phù hợp với frontend
            const formattedProducts = products.map(product => ({
                _id: product._id,
                name: product.productName,
                description: product.description,
                price: product.price,
                image: product.images && product.images.length > 0 ? product.images[0] : null,
                categoryID: product.categoryID ? {
                    _id: product.categoryID._id,
                    categoryName: product.categoryID.categoryName
                } : null,
                status: product.status || 'active'
            }));

            res.json({
                success: true,
                data: {
                    products: formattedProducts,
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({
                success: false,
                message: 'Không thể tải danh sách sản phẩm'
            });
        }
    },

    // Lấy chi tiết sản phẩm
    getProductById: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id })
                .notDeleted()
                .populate('categoryID');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Tạo sản phẩm mới
    createProduct: async (req, res) => {
        try {
            const {
                productName,
                description,
                price,
                categoryID,
                status
            } = req.body;

            // Kiểm tra category tồn tại
            const existingCategory = await Category.findOne({ 
                _id: categoryID
            }).notDeleted();

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Danh mục không tồn tại'
                });
            }

            // Xử lý ảnh nếu có
            let images = [];
            if (req.files && req.files.length > 0) {
                images = req.files.map(file => file.path);
            }

            // Tạo sản phẩm mới
            const product = new Product({
                productName,
                description,
                price,
                categoryID,
                status: status || 'active',
                images
            });

            await product.save();

            // Populate category khi trả về response
            await product.populate('categoryID');

            res.status(201).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Cập nhật sản phẩm
    updateProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id }).notDeleted();

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            // Nếu cập nhật category, kiểm tra category mới tồn tại
            if (req.body.categoryID) {
                const existingCategory = await Category.findOne({ 
                    _id: req.body.categoryID 
                }).notDeleted();
                
                if (!existingCategory) {
                    return res.status(404).json({
                        success: false,
                        message: 'Danh mục không tồn tại'
                    });
                }
            }

            // Cập nhật các trường cơ bản
            const updateData = {
                productName: req.body.productName,
                description: req.body.description,
                price: req.body.price,
                categoryID: req.body.categoryID,
                status: req.body.status
            };

            // Xử lý ảnh nếu có
            if (req.files && req.files.length > 0) {
                updateData.images = req.files.map(file => file.path);
            }

            Object.assign(product, updateData);
            await product.save();

            // Populate category khi trả về response
            await product.populate('categoryID');

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Xóa mềm sản phẩm
    deleteProduct: async (req, res) => {
        try {
            const product = await Product.findOne({ _id: req.params.id }).notDeleted();

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm'
                });
            }

            product.isDeleted = true;
            product.deletedAt = new Date();
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Đã xóa sản phẩm thành công'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Khôi phục sản phẩm đã xóa
    restoreProduct: async (req, res) => {
        try {
            const product = await Product.findOne({
                _id: req.params.id,
                isDeleted: true
            });

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm đã xóa'
                });
            }

            product.isDeleted = false;
            product.deletedAt = null;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Đã khôi phục sản phẩm thành công',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    // Lấy danh sách sản phẩm đã xóa (chỉ admin)
    getDeletedProducts: async (req, res) => {
        try {
            const products = await Product.find()
                .onlyDeleted()
                .populate('categoryID');

            res.status(200).json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = productController; 