import express from "express"
import userController from "./Modules/User/user.controller.js"
import dbConnection from "./DB/connection.js"
import noteController from "./Modules/Note/Note.controller.js"
import { port } from "./config/config.services.js"
import cors from "cors"

export default (app) => {


    app.use(express.json())

    app.use(cors())
    app.use("/upload", express.static("upload"))
    dbConnection()

    app.use("/users", userController)
    app.use("/notes", noteController)

      app.get("/",(req, res) => {
        res.status(200).json({
            message: "Hello"
        })
    })

    app.use((err, req, res, next) => {
        res.status(err.cause || 500).json({
            message: err.message,
            stack: err.stack
        })
    })

    app.listen(port, () => {
        console.log(`server is running at port ${port}`);
    })
}