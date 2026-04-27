import { v2 as cloudinary } from "cloudinary"
import { Cloud_Api_key, Cloud_Api_Secret, Cloud_Name } from "../config/config.services.js";

cloudinary.config({
    cloud_name: Cloud_Name,
    api_key: Cloud_Api_key,
    api_secret: Cloud_Api_Secret
});




export default cloudinary