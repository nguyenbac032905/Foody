const Comment = require("../../models/comment.model");

module.exports.createComment = async (req,res) => {
    try{
        const userId = res.locals.user._id;
        const dataComment = {
            user_id: userId,
            product_id: req.body.productId,
            rating: Number(req.body.rating),
            content: req.body.content,
            image: req.body.image
        }
        const comment = new Comment(dataComment);
        await comment.save();
        res.redirect(req.get("referer"));
    }catch(error){
        if(error.code === 11000){
            req.flash("error", "Bạn đã đánh giá sản phẩm này rồi.");
            res.redirect(req.get("referer"));
        }else{
            req.flash("error", "Lỗi hệ thống, vui lòng thử lại sau.");
            res.redirect(req.get("referer"));
        }
    }
}