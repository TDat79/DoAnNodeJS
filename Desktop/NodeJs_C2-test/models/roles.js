let mongoose = require('mongoose');

let roleSchema = mongoose.Schema({
    roleName:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        default:""
    }
},{
    timestamps:true
})
module.exports =  mongoose.model('Role',roleSchema)
