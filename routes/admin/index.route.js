//import routes để sử dụng
const dashboardRoutes = require("./dashboard.route");
const productRoutes = require("./product.route");
const productCategoryRoutes = require("./product-category.route");
const roleRoutes = require("./role.route");
const accountRoutes = require("./account.route");
const authenRoutes = require("./auth.route");
const myAccountRoutes = require("./my-account.route");
const settingGeneralRoutes = require("./setting-general.route");
const chatRoutes = require("./chat.route");
const customerRoutes = require("./customer.route");
const orderRoutes = require("./order.route");
const blogRoutes = require("./blog.route");
const blogCategoryRoutes = require("./blog-category.route");
const couponRoutes = require("./coupon.route");
const commentRoutes = require("./comment.route");

const systemConfig = require("../../config/system");

const authMiddleware = require("../../middlewares/admin/auth.middleware");
const chatMiddleware = require("../../middlewares/admin/chat.middleware");
module.exports = (app) => {
  const PATH_ADMIN = systemConfig.prefixAdmin;
  app.use(PATH_ADMIN + "/dashboard",authMiddleware.requireAuth,chatMiddleware.support,dashboardRoutes);
  app.use(PATH_ADMIN + "/products",authMiddleware.requireAuth,chatMiddleware.support,productRoutes);
  app.use(PATH_ADMIN + "/product-category",authMiddleware.requireAuth,chatMiddleware.support,productCategoryRoutes);
  app.use(PATH_ADMIN + "/roles",authMiddleware.requireAuth,chatMiddleware.support,roleRoutes);
  app.use(PATH_ADMIN + "/accounts",authMiddleware.requireAuth,chatMiddleware.support,accountRoutes);
  app.use(PATH_ADMIN + "/auth",authenRoutes);
  app.use(PATH_ADMIN + "/my-account",authMiddleware.requireAuth,chatMiddleware.support,myAccountRoutes);
  app.use(PATH_ADMIN + "/settings",authMiddleware.requireAuth,chatMiddleware.support,settingGeneralRoutes);
  app.use(PATH_ADMIN + "/chat",authMiddleware.requireAuth,chatMiddleware.support,chatRoutes);
  app.use(PATH_ADMIN + "/customers",authMiddleware.requireAuth,chatMiddleware.support,customerRoutes);
  app.use(PATH_ADMIN + "/orders",authMiddleware.requireAuth,chatMiddleware.support,orderRoutes);
  app.use(PATH_ADMIN + "/blogs",authMiddleware.requireAuth,chatMiddleware.support,blogRoutes);
  app.use(PATH_ADMIN + "/blog-category",authMiddleware.requireAuth,chatMiddleware.support,blogCategoryRoutes);
  app.use(PATH_ADMIN + "/coupon",authMiddleware.requireAuth,chatMiddleware.support,couponRoutes);
  app.use(PATH_ADMIN + "/comments",authMiddleware.requireAuth,chatMiddleware.support,commentRoutes);
};