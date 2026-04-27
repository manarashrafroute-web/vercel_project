import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters"],
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    content: {
        type: String,
        required: [true, "Content is required"],
        trim: true,
        minlength: [1, "Content cannot be empty"],
        maxlength: [5000, "Content cannot exceed 5000 characters"]
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"],
        index: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
        virtuals: true,

    },
    toObject: {
        virtuals: true,
    }
});
const Note = mongoose.model("Note", noteSchema);
export default Note;