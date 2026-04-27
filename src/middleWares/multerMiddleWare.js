
import multer from "multer"
import { error } from "node:console"
import fs from "node:fs"

// export let multerLocal = () => {
//     return multer({ dest: "upload" })
// }

export let extinstions = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    video: ["video/mp4", "video/mov", "video/webp"],
    pdf: ["application/pdf"]
}


export let multerLocal = ({ customPath, allowedType } = { customPath: "general" }) => { // uploads/general
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // uploads/profilImage
            let filePath = `upload/${customPath}` // fs folder1/folder/folder
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true })
            }
            cb(null, `upload/${customPath}`)
        },
        filename: function (req, file, cb) {

            let prefix = Date.now()
            const fileName = `${prefix}-${file.originalname}`
            cb(null, fileName)
        }
    })
    let fileFilter = function (req, file, cb) {
        let fileType = file.mimetype.split("/")[0]


        console.log(fileType);
        console.log(file.mimetype);

        console.log(allowedType);



        if (allowedType.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("wrong type"), false)
        }

    }

    return multer({
        storage, fileFilter, limits: {
            fileSize: 5 * 1024 * 1024
        }
    })
}



export let multer_cloud = ({ allowedType = [] }) => { // uploads/general
    const storage = multer.diskStorage({
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    })
    let fileFilter = function (req, file, cb) {
        if (allowedType.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error("wrong type"), false)
        }

    }

    const upload = multer({ storage })

    return upload
}