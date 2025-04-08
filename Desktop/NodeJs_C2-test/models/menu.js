let mongoose = require('mongoose');
let menuSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    URL: {
        type: String,
        default: "/"
    },
    parent: {
        type: mongoose.Types.ObjectId,
        ref: 'menu'
    }
})
module.exports = mongoose.model('menu', menuSchema)