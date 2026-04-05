const Comment = require("../../models/comment.model");

module.exports.deleteComment = async (req,res) => {
    try{
        const idComment = req.params.idComment;
        await Comment.updateOne({_id: idComment}, {deleted: true});
        req.flash("success", "Xóa bình luận thành công");
        res.redirect(req.get("Referer"));
    }catch(error){
        req.flash("error", "Có lỗi xảy ra, vui lòng thử lại sau");
        res.redirect(req.get("Referer"));
    }
}