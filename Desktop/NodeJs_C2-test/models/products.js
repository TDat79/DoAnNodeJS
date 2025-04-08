const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        type: String
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'outOfStock'],
        default: 'active'
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Tạo index
productSchema.index({ productName: 'text', description: 'text' });
productSchema.index({ isDeleted: 1, categoryID: 1, status: 1 });

// Query helpers
productSchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

productSchema.query.onlyDeleted = function() {
    return this.where({ isDeleted: true });
};

productSchema.query.withDeleted = function() {
    return this;
};

productSchema.query.active = function() {
    return this.where({ status: 'active' });
};

// Tính giá sau khi giảm giá
productSchema.virtual('finalPrice').get(function() {
    return this.price * (1 - this.discount / 100);
});

// Đảm bảo virtuals được include khi chuyển đổi sang JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Middleware để tự động cập nhật status dựa trên quantity
productSchema.pre('save', function(next) {
    if (this.isModified('quantity')) {
        this.status = this.quantity > 0 ? 'active' : 'outOfStock';
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;