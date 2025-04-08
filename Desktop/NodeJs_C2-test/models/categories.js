const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ""
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Tạo index cho isDeleted để tối ưu tìm kiếm
categorySchema.index({ isDeleted: 1 });

// Query helper để lấy categories chưa xóa
categorySchema.query.notDeleted = function() {
    return this.where({ isDeleted: false });
};

// Query helper để lấy categories đã xóa
categorySchema.query.onlyDeleted = function() {
    return this.where({ isDeleted: true });
};

// Query helper để lấy tất cả categories
categorySchema.query.withDeleted = function() {
    return this; // Trả về tất cả, không filter
};

// Method để thực hiện soft delete
categorySchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return await this.save();
};

// Method để khôi phục category đã xóa
categorySchema.methods.restore = async function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return await this.save();
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
