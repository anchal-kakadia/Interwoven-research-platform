import mongoose, { Schema } from 'mongoose'

const LINK_SCHEMA = new Schema({
    token: {
        type: String,
    }, 
    used: {
        type: Boolean,
        default: false
    }
})

const UniqueLink = mongoose.model('UniqueLink', LINK_SCHEMA);
export default UniqueLink;

