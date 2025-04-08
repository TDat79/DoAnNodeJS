var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
let cors = require('cors')
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

// Import các routes có sẵn
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Import các routes mới
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const reviewRoutes = require('./routes/reviews');
const couponRoutes = require('./routes/coupons');
const paymentRoutes = require('./routes/payments');

var app = express();

// Cấu hình CORS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Kết nối MongoDB
mongoose.connect("mongodb://localhost:27017/C2");
mongoose.connection.on("connected", () => {
  console.log("connected");
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cấu hình multer cho upload file
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
        // Chỉ chấp nhận file ảnh
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
        }
        cb(null, true);
    }
});

// Routes cho các file HTML tĩnh
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/admin.html'));
});

app.get('/products', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/products.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/cart.html'));
});

// Routes có sẵn
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/auth', require('./routes/auth'));
app.use('/menus', require('./routes/menus'));
app.use('/roles', require('./routes/roles'));

// Thêm các routes mới
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// Route upload file
app.post('/upload', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Không có file nào được tải lên'
            });
        }

        const filePaths = req.files.map(file => file.path);
        res.json({
            success: true,
            data: filePaths
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tải lên file'
        });
    }
});

// Serve partials
app.get('/pages/partials/:partial', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pages/partials', req.params.partial));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send({
    success: false,
    message: err.message
  });
});

module.exports = app;