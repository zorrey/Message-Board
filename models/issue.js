const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    docModel: {
        type: String,
        required: true,
        enum: ['Discussion', 'Message']
      },
      
    type: {
        type: String,
        required: true,
        enum: ['Discussion', 'Message', 'Reply']
      },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'docModel',
        required:true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true        
    }
}, { timeStamp: true })
module.exports = mongoose.model('Issue', issueSchema)