// [GET] /products
const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const priceNewProduct = require("../../helpers/product");
const productCategoryHelper = require("../../helpers/product-category");
const Comment = require("../../models/comment.model");
module.exports.index = async (req, res) => {

  const products = await Product.find({
    status: "active",
    deleted: false,
  }).sort({ position: "desc" });
  const newProductsFeatured = priceNewProduct.newPrice(products);

  res.render("client/pages/products/index", {
    pageTitle: "Trang sản phẩm",
    products: newProductsFeatured,
  });
};
module.exports.detail = async (req, res) => {
  try {
    const find = {
      deleted: false,
      slug: req.params.slugProduct,
      status: "active"
    };

    const product = await Product.findOne(find);
    if(product.product_category_id){
      const category = await ProductCategory.findOne({
        deleted: false,
        status: "active",
        _id: product.product_category_id
      });
      product.category = category;
    }
    product.newPrice = priceNewProduct.newPriceProduct(product);
    const reviews = await Comment.find({deleted: false, product_id: product._id}).populate("user_id", "fullName");
    res.render("client/pages/products/detail", {
      pageTitle: product.pageTitle,
      product: product,
      reviews: reviews
    });
  } catch (error) {
    res.redirect("/products");
  }
};
module.exports.category = async (req,res) =>{
  
    const category = await ProductCategory.findOne({
        deleted: false,
        status: "active",
        slug: req.params.slugCategory
    });

    const listSubCategory = await productCategoryHelper.getSubCategory(category.id);
    const listSubCategoryId = listSubCategory.map(item => item.id);
    
    const products = await Product.find({
        deleted: false,
        status: "active",
        product_category_id: {$in: [category.id,...listSubCategoryId]}
    }).sort({position: "desc"});
    const newProducts = priceNewProduct.newPrice(products);

    res.render("client/pages/products/index", {
        pageTitle: category.title,
        products: newProducts,
    });
  
}
