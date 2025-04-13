import mongoose, { Schema } from 'mongoose'

const COMMENTS = new Schema({
    id: {
        type: String
    },
    review: {
        type: String
    }
})

const REVIEWER_SCHEMA = new Schema({
    id: {
        type: String
    },
    name: {
        type: String,
    },
    file_id: {
        type: String
    },
    comments: [COMMENTS]
})

const FILE_SCHEMA = new Schema({
    file_id: {
        type: String
    },
    file_name: {
        type: String,
    },
    file_data: {
        type: Buffer
    },
    file_description : {
        type: String
    },
    status: {
        type: String,
        default: 'pending'
    },
    reason: {
        type: String,
    },
    author: {
        type: String
    },
    authorId: {
        type: String
    },
    reviewers: [REVIEWER_SCHEMA],
    reviews: {
        type: Array,
        default: []
    }
})

const USER_SCHEMA = new Schema({
    id: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: 'author'
    },
    specialization_field: { type: [String], default: [] },
    files: [FILE_SCHEMA]
})

const User = mongoose.model('User', USER_SCHEMA);
export default User;

