import jwt from "jsonwebtoken"
import User from "../DB/models/user.model.js";
import { secret, Secret_key } from "../config/config.services.js";

export const auth = async (req, res, next) => {
    try {
        let { authorization } = req.headers;
        //     console.log({ authorization });
        if (!authorization) {
            return res.status(401).json({ message: "Authorization token required" })
        }
        let token = authorization.split(" ")

        if (token[0] !== secret || !token[1]) {
            throw new Error("invalid token")
        }
        //let decoded = jwt.verify(token[1], "smkddklskdkd")
        let data = jwt.verify(token[1], Secret_key)
        let user = await User.findById(data.id)

        if (!user) {
            return res.status(401).json({
                message: "User not found or may have been deleted"
            });
        }

        req.user = user
        next()

    } catch (error) {
        console.log(error.message, error.stack);
        throw new Error("invalid token")
    }
}

// iat اتعمل امتي و الوقت بالملي سكند