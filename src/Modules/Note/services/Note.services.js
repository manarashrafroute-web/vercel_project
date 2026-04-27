import Note from "../../../DB/models/note.model.js"
import User from "../../../DB/models/user.model.js";

export const CreateNoteServices = async (noteData, user) => {
    try {
        console.log(user);

        // Optional: Verify user still exists in database
        const existingUser = await User.findById(user._id);
        if (!existingUser) {
            throw new Error("User no longer exists");
        }
        // Associate the note with the authenticated user
        const note = await Note.create({
            ...noteData,
            userId: user._id // or user.id depending on your schema
        });

        await note.populate('userId', 'name email');

        return note;
    } catch (error) {
        throw new Error(`Failed to create note: ${error.message}`);
    }
}
