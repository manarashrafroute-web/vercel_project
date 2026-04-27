import { Router } from "express";
import * as noteServices from "./services/Note.services.js";
import { auth } from "../../middleWares/authMiddleWare.js";

const noteController = Router();

noteController.post("/create-note", auth, async (req, res) => {
    try {
        // Pass both the note data and the authenticated user
        const data = await noteServices.CreateNoteServices(req.body, req.user);

        return res.status(201).json({
            message: "Note created successfully",
            note: data
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            message: "Failed to create note",
            error: error.message
        });
    }
});

export default noteController;