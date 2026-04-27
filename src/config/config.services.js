import { configDotenv } from "dotenv";
import path from "node:path"


let nodeEnv = process.env.NODE_ENV;
let envPath = ""
// switch (nodeEnv) {
//     case "development":
//         envPath = "./src/config/.env.development"
//         break;

//     case "production":
//         envPath = "./src/config/.env.production"
//         break;

//     default:
//         throw new Error("node env is not  defined" )
// }


if (nodeEnv == "production") {
    envPath = "./src/config/.env.production"
} else if (nodeEnv == "development") {
    envPath = "./src/config/.env.development"
} else {

}

//configDotenv({ path: path.resolve(envPath)})

configDotenv({ path: path.resolve(`./src/config/.env.${nodeEnv}`) })

export let port = process.env.port
export let dbUri = process.env.DB
export let E_secret = process.env.ENCRYPTION_SECRET_KEY
export let saltNumber = process.env.SALT_ROUND
export let Secret_key = process.env.TOKEN_SECRET_KEY
export let secret = process.env.BEARER

export const Cloud_Name = process.env.CLOUD_NAME

export const Cloud_Api_key = process.env.CLOUDNENERY_API_KEY

export const Cloud_Api_Secret = process.env.CLOUDNENERY_API_SECRET