import mongoose from "mongoose";
import { dbUri } from "../config/config.services.js";

const dbConnection = async () => {
    try {
        await mongoose.connect(dbUri)
        console.log(`MongoDB connected successflly`);

    } catch (error) {
        console.error(`conection falid `, error.message);

    }
}


export default dbConnection