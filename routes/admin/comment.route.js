const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admin/comment.controller");

router.delete("/delete/:idComment", controller.deleteComment);

module.exports = router;