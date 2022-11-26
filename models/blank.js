const { Schema, model } = require("mongoose");

const schema = new Schema({
    nick:{
        type: String,
        require:true
    },
    description:{
        type: String,
        require:true
    },
    age:{
        type: Number,
        require:true
    },
    play_age:{
        type: Number,
        require:true
    },
    reason:{
        type: String,
        require:true
    },
    play_time:{
        type: String,
        require:true
    },
    ip:{
        type: String,
        require:true
    },
    status:{
        type: Number,
        require:true
    }

})

module.exports = model('blank', schema);