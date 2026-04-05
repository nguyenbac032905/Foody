const express = require("express");
const router = express.Router();
const controller = require("../../controllers/client/comment.controller");
const multer = require("multer");
const upload = multer();
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

router.post("/",upload.single("image"),uploadCloud.upload, controller.createComment);

module.exports = router;