const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    content: String,
    image: String,
    deleted: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

commentSchema.index({ user_id: 1, product_id: 1}, {unique: true});
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;