import { compareSync, hashSync } from "bcrypt"
import User from "../../../DB/models/user.model.js"
import CryptoJS from "crypto-js"
import { isValidObjectId } from "mongoose"
import jwt from "jsonwebtoken"
import { E_secret, Secret_key } from "../../../config/config.services.js"
import { OAuth2Client } from "google-auth-library"
import cloudinary from "../../../utils/cloudinery.js"



/**
 * create
 * save
 * insertMany
 */


// plain text = "1232425462" 
// secret key = "425262776" ,
//chipher text = "68yrwu nw thuwwhtwhjijkf"


export const RegistertionServices = async (data, file) => {

    // email not exists 
    const isEmailExists = await User.findOne({
        email: data.email // req.body.email
    })

    if (isEmailExists) return "emailExists"

    // // hashing
    // const hashPassword = hashSync(data.password, 10)
    //encrption 

    const ecryptPhoneNumber = CryptoJS.AES.encrypt(data.phone, E_secret).toString()
    console.log(ecryptPhoneNumber);


    const userData = {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: ecryptPhoneNumber,
        age: data.age,
        gender: data.gender,
        isActive: data.isActive,
        image: data.image
    }

    // cloud // users / user id / profile
    const user = await User.create(userData);

    if (file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, {
            folder: `users/${user._id}/profileImage`,
            resource_type: "image"
        })

        user.profileImage = {
            public_id, secure_url
        }

        await user.save()
    }
    // const user = new User(userData)
    // // await user.save()
    // console.log(user);

    const { password, phone, ...safeUser } = user.toObject()

    return {
        ...safeUser,
        _id: user._id
    }


}



export const LoginServices = async (data) => {

    // if (data.email && data.phone) return "OnlyOne"
    if (!data.email) return "youMustUseEmail"
    const user = await User.findOne({
        email: data.email // req.body.email
    })
    console.log(user);


    if (!user) return "userNotFound"


    const comparePassword = compareSync(data.password, user.password)

    if (!comparePassword) return "worngCredaintianl"

    return {
        token: jwt.sign({ id: user._id }, Secret_key)
    }

}



export const RemoveProfileImageServices = async (req) => { // 


    // profile image // 
    const { profileImage } = await User.findOne({ _id: req.user._id }).select("profileImage")
    console.log(profileImage);

    // remove Cloudinery 

    const data = await cloudinary.uploader.destroy(profileImage.public_id)

    await User.findOneAndUpdate({ _id: req.user._id }, { $set: { profileImage: {} } }, { new: true }) // new :true 

    return data


}


// social login using gmail == example@gmail.com


async function verifyGoogleAccount({ idToken }) {

    const client = new OAuth2Client()
    const ticket = await client.verifyIdToken({
        idToken,
        //   audience: Client_ID
    })



    const payload = ticket.getPayload()


    return payload

}


export const SignUpWithGoogleServices = async (GoogleData) => {

    const { idToken } = GoogleData
    console.log({ idToken });

    const payload = await verifyGoogleAccount({ idToken })

    console.log({ payload });


    if (!payload.email_verified)
        return { error: "emailNotVirifyed" }

    const isEmailExists = await User.findOne({
        email: payload.email // req.body.email
    })

    if (isEmailExists) return "emailExists"

    const userData = {
        name: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        avatar: payload.picture,
        isConfirmed: true,
        googleId: payload.sub,

    }

    const newUser = await User.create(userData)

    return {
        success: true,
        message: "user Created successflly ",
        user: newUser
    }


}



export const LoginWithGoogleServices = async (GoogleData) => {

    const { idToken } = GoogleData
    console.log({ idToken });

    const payload = await verifyGoogleAccount({ idToken })

    console.log({ payload });


    if (!payload.email_verified) //
        return { error: "emailNotVirifyed" }

    const user = await User.findOne({
        email: payload.email // req.body.email
    })

    if (!user) return SignUpWithGoogleServices(GoogleData)


    return {
        success: true,
        message: "user loged in successflly "
    }


}




export const UpdateUserServices = async (userId, updateData) => {
    try {
        // Find user first to check if exists
        const user = await User.findById(userId);
        if (!user) return "userNotFound"


        // Fields that cannot be updated directly
        const forbiddenFields = ['_id', 'password', 'phone', 'createdAt', 'updatedAt', '__v'];

        // Remove forbidden fields from update data
        forbiddenFields.forEach(field => {
            delete updateData[field];
        });

        // Check if email is being updated and if it's already taken
        if (updateData.email && updateData.email !== user.email) {
            const existingUser = await User.findOne({ email: updateData.email });
            if (existingUser) return "emailExists"
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password -phone'); // Exclude password from response

        return updatedUser;

    } catch (error) {
        throw new Error(`Update failed: ${error.message}`);
    }

}




export const DeleteUserServices = async (userId) => {
    try {
        // Check if user exists
        // const user = await User.findById(userId);
        // if (!user) {
        //     throw new Error("User not found");
        // }
        // Option 1: Hard delete (permanent)
        const deletedUser = await User.findById({ _id: userId });

        //console.log(deletedUser);


        if (deletedUser) {
            await cloudinary.api.delete_resources_by_prefix(`users/${deletedUser.id}/profileImage` , {
                resource_type : "video"
            })
            // delete folder
            await cloudinary.api.delete_folder(`users/${deletedUser._id}`).catch((err) => {
                console.log(err)
                console.log(err.message);
                console.log(err.stack);
            })
        }

        // // Option 2: Soft delete (recommended)
        // const deletedUser = await User.findByIdAndUpdate(
        //     userId,
        //     {
        //         $set: {
        //             isDeleted: true,
        //             deletedAt: new Date(),
        //             // Optional: Anonymize personal data
        //             email: `deleted_${userId}@deleted.com`,
        //             name: "Deleted User"
        //         }
        //     },
        //     { new: true }
        // );

        return {
            message: "User deleted successfully",
            userId: deletedUser._id
        };


    } catch (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }

}

// 
export const ListUsersServices = async () => {

    const users = await User.find().select("name email age -_id").lean() // 

    return users


}


export const GetUserByIdServices = async (userId) => {

    if (!isValidObjectId(userId)) return "invalidId"

    const user = await User.findById(userId).select("name email phone -_id").lean()

    if (user?.phone) {
        const decryption = CryptoJS.AES.decrypt(user.phone, E_secret)
        user.phone = decryption.toString(CryptoJS.enc.Utf8)

    }

    if (!user) return "userNotFound"


    return user


}



export const updatepassword = async (userId) => {

    if (!isValidObjectId(userId)) return "invalidId"

    const user = await User.findById(userId).select("name email phone -_id").lean()

    if (user?.phone) {
        const decryption = CryptoJS.AES.decrypt(user.phone, E_secret)
        user.phone = decryption.toString(CryptoJS.enc.Utf8)

    }

    if (!user) return "userNotFound"


    return user


}


export const Forgetpassword = async (userId) => {

    if (!isValidObjectId(userId)) return "invalidId"

    const user = await User.findById(userId).select("name email phone -_id").lean()

    if (user?.phone) {
        const decryption = CryptoJS.AES.decrypt(user.phone, E_secret)
        user.phone = decryption.toString(CryptoJS.enc.Utf8)

    }

    if (!user) return "userNotFound"


    return user


}

