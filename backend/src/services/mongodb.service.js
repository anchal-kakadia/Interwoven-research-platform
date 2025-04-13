import mongoose, {Mongoose} from "mongoose";

let mongodb

export const connectToMongoDB = async(uri) => {
    mongodb = await mongoose.connect(uri);
    return mongodb
}

export const getMongoDB = () => mongodb