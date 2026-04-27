import { Router } from "express";
import * as userSrvices from "./services/user.services.js";
import { auth } from "../../middleWares/authMiddleWare.js";
import { extinstions, multer_cloud, multerLocal } from "../../middleWares/multerMiddleWare.js";
import cloudinary from "../../utils/cloudinery.js";
import User from "../../DB/models/user.model.js";


const userController = Router()


userController.post("/cloudinery", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {
    const data = await cloudinary.uploader.upload(req.file.path, {
        // public_id: "profileImage",
        folder: `users/${req.user._id}/profile`,
        resource_type: "image",
        // allowed_formats : ["jpg"]
        //    use_filename : true,
        //    unique_filename : false,
        // transformation: [{ width: 400, height: 400, crop: "fill" }]  
        eager: [
            { width: 300, height: 300, crop: "pad" },
            { width: 160, height: 100, crop: "crop" }],
    })
    return res.status(200).json({
        message: "Done",
        data
    })

})


userController.post("/single", multerLocal({ customPath: "profileImage", allowedType: [...extinstions.image, ...extinstions.pdf, ...extinstions.video] }).single("image"), async (req, res) => {
    //console.log(req);
    let baseUrl = `${req.protocol}://${req.host}`
    req.file.finalPath = `${baseUrl}/${req.file.destination}/${req.file.filename}`

    return res.status(200).json({
        message: "Done",
        file: req.file,
        body: req.body
    })

})

userController.post("/array", multerLocal({ customPath: "array" }).array("image", 5), async (req, res) => {

    console.log(req.host);
    console.log(req.hostname);
    console.log(req.protocol);

    // finel path = http /

    let baseUrl = `${req.protocol}://${req.host}`

    return res.status(200).json({
        message: "Done",
        file: req.files.map((file) => {
            file.finalPath = `${baseUrl}/${file.destination}/${file.filename}`

            return file
        })
    })

})


userController.post("/field", multerLocal({ customPath: "fields" }).fields([
    { name: 'profile', maxCount: 1 },
    { name: "cover", maxCount: 2 },
    { name: "cv", maxCount: 1 }
]), async (req, res) => {


    let baseUrl = `${req.protocol}://${req.host}`


    let fields = ["profile", "cover", "cv"]


    for (let i = 0; i < fields.length; i++) {
        req.files[fields[i]] = req.files[fields[i]].map((file) => {
            file.finalPath = `${baseUrl}/${file.destination}/${file.filename}`
            return file
        })
    }

    return res.status(200).json({
        message: "Done",
        file: req.files
    })

})

userController.post("/any", multerLocal({ customPath: "any" }).any(), async (req, res) => {
    let baseUrl = `${req.protocol}://${req.host}`

    return res.status(200).json({
        message: "Done",
        file: req.files.map((file) => {
            file.finalPath = `${baseUrl}/${file.destination}/${file.filename}`
            return file
        }),
        body: req.body
    })

})

userController.post("/none", multerLocal().none(), async (req, res) => {

    return res.status(200).json({
        message: "Done",
        body: req.body
    })

})


userController.post("/signup", multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const data = await userSrvices.RegistertionServices(req.body, req.file)

    if (data === "emailExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Created successflly ", user: data })

})


userController.delete("/remove-profile-image", auth, async (req, res) => {
    const data = await userSrvices.RemoveProfileImageServices(req)
    return res.status(200).json({
        message: "Done",
        data
    })

})



userController.post("/add-profile-image", auth, multer_cloud({ allowedType: extinstions.image }).single("image"), async (req, res) => {

    const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, {
        folder: `users/${req.user._id}/profileImage`
    })

    await User.findOneAndUpdate({ _id: req.user.id }, { $set: { profileImage: { public_id, secure_url } } }, { new: true })

    return res.status(200).json({
        message: "Image added"
    })

})



userController.post("/Login", async (req, res) => {

    const data = await userSrvices.LoginServices(req.body)

    // if (data === "OnlyOne") {
    //     return res.status(409).json({ message: "insert phone or email" })
    // }


    if (data === "youMustUseEmail") {
        return res.status(409).json({ message: "use Email" })
    }


    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }


    if (data === "worngCredaintianl") {
        return res.status(400).json({ message: "Wrong creadantial" })
    }

    return res.status(200).json({ message: "user LogIn successflly ", user: data })

})


userController.post("/signup/gmail", async (req, res) => {

    console.log(req.body);

    const data = await userSrvices.SignUpWithGoogleServices(req.body)


    if (data === "emailNotVirifyed") {
        return res.status(409).json({ message: "you must verify ggogle account " })
    }


    if (data === "emailExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Created successflly ", user: data })

})



userController.post("/Login/gmail", async (req, res) => {


    const data = await userSrvices.LoginWithGoogleServices(req.body)


    if (data === "emailNotVirifyed") {
        return res.status(409).json({ message: "you must verify ggogle account " })
    }


    return res.status(200).json({ message: "user logedIn successflly ", user: data })

})




userController.put("/update", auth, async (req, res) => {

    const data = await userSrvices.UpdateUserServices(req.user._id, req.body)

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    if (data === "emailExists") {
        return res.status(409).json({ message: "user already exists" })
    }

    return res.status(200).json({ message: "user Updtaed successflly ", data })

})



// Delete user (soft delete)
userController.delete("/delete", auth, async (req, res) => {
    try {
        const result = await userSrvices.DeleteUserServices(req.user._id);

        return res.status(200).json({
            message: "User deleted successfully",
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            message: "Failed to delete user",
            error: error.message
        });
    }
});


userController.get("/", async (req, res) => {

    const result = await userSrvices.ListUsersServices()


    return res.status(200).json({ message: "users", users: result })
})



userController.get("/getUserById/:id", auth, async (req, res) => {


    const data = await userSrvices.GetUserByIdServices(req.params.id)


    if (data === "invalidId") {
        return res.status(422).json({ message: "invalid user id" })
    }

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    return res.status(200).json({ message: "user", user: data })


})


userController.put("/updtaePassword/:id", auth, async (req, res) => {


    const data = await userSrvices.updatepassword(req.params.id)


    if (data === "invalidId") {
        return res.status(422).json({ message: "invalid user id" })
    }

    if (data === "userNotFound") {
        return res.status(404).json({ message: "user Not Found" })
    }

    return res.status(200).json({ message: "user", user: data })


})



export default userController
