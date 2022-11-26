const { Schema, model } = require("mongoose");

const schema = new Schema({
    ip: {
        type:String
    },
    id:{
        type: String
    }


})

module.exports = model('message', schema);