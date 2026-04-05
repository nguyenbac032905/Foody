//import routes để sử dụng
const productRoutes = require("./products.route");
const homeRoutes = require("./home.route");
const cartMiddleware = require("../../middlewares/client/cart.middleware");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const usersRoutes = require("./users.route");
const roomChatRoutes = require("./room-chat.route");
const blogRoutes = require("./blog.route");
const sitemapRoutes = require("./sitemap.route");
const paymentRoutes = require("./payment.route");
const commentRoutes = require("./comment.route");

const userMiddleware = require("../../middlewares/client/user.middleware");
const settingMiddleware = require("../../middlewares/client/setting.middleware");
const authenMiddleware = require("../../middlewares/client/auth.middleware");
const chatMiddleware = require("../../middlewares/client/chat.middleware");

module.exports = (app) => {
  app.use(cartMiddleware.cartId);
  app.use(userMiddleware.infoUser);
  app.use(settingMiddleware.settingGeneral);
  app.use(chatMiddleware.support);

  app.use("/",homeRoutes);
  //truyền /products vào productRoutes
  app.use("/products", productRoutes);
  app.use("/search",searchRoutes);
  app.use("/cart",cartRoutes)
  app.use("/checkout",checkoutRoutes);
  app.use("/user",userRoutes);
  app.use("/chat",authenMiddleware.requireAuth,chatRoutes);
  app.use("/users",authenMiddleware.requireAuth,usersRoutes);
  app.use("/rooms-chat",roomChatRoutes);
  app.use("/blogs",blogRoutes);
  app.use("/", sitemapRoutes);
  app.use("/payment", paymentRoutes);
  app.use("/reviews",authenMiddleware.requireAuth,commentRoutes);
};
