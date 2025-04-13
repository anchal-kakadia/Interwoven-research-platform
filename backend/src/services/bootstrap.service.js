import { config } from "dotenv";
import { assignEnvironmentVariable } from "../helper/helper.js";
import { connectToMongoDB } from "./mongodb.service.js";

config()

const bootstrap = async () => {
    try {
        const uri = assignEnvironmentVariable('MONGODB_URI') || ''

        const db = await connectToMongoDB(uri);
        db.connection.useDb('intervowen')

        console.info('[mongodb] Connected to MongoDB Atlas')
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

export default bootstrap;