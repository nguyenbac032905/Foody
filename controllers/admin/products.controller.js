
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const createTreeHelper = require("../../helpers/createTree");
const ProductCategory = require("../../models/product-category.model");
// [GET] /admin/products
module.exports.index = async (req,res) => {
    let find = {
        deleted: false
    };
    //filterstatus
    const filterStatus = filterStatusHelper(req);
    if(req.query.status){
        find.status = req.query.status;
    };
    //search
    const objectSearch = searchHelper(req);
    if(objectSearch.regex){
        find.title = objectSearch.regex;
    };

    //phantrang
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req,
        countProducts
    );
    //sortKey
    let sort = {};
    if(req.query.sortKey && req.query.sortValue){
        sort[req.query.sortKey] = req.query.sortValue
    }else{
        sort.position = "desc"
    }

    const products = await Product.find(find)
        .sort(sort)
        .limit(objectPagination.limitItem)
        .skip(objectPagination.skip);
    //lấy thông tin người cập nhật gần nhất
    for(const item of products){
        const user = await Account.findOne({
            _id: item.createdBy.account_id
        });
        if(user){
            item.accountFullname = user.fullName;
        };
         // lấy ra thông tin người cập nhật gần nhất
        const updatedBy = item.updatedBy[item.updatedBy.length - 1];
        if(updatedBy){
            const userUpdated = await Account.findOne({
                _id: updatedBy.account_id
            });
            updatedBy.accountFullname = userUpdated.fullName
        }
    }
    res.render("admin/pages/products/index",{
        pageTitle: "Trang sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
};

//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req,res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };
    
    await Product.updateOne({_id: id},{status: status,$push: {updatedBy: updatedBy}});
    req.flash('success', 'Cập nhật trạng thái thành công!');
    //quay lại trang trước
    res.redirect(req.get("Referer") || "/admin/products");
};

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req,res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(",");
    const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
    };

    switch (type) {
        case "active":
            await Product.updateMany({_id: {$in: ids}},{$set: {status: "active"},$push: {updatedBy: updatedBy}});
            req.flash('success', `Cập nhật ${ids.length} sản phẩm thành hoạt động`);
            break;
        case "inactive":
            await Product.updateMany({_id: {$in: ids}},{$set: {status: "inactive"},$push: {updatedBy: updatedBy}});
            req.flash('success', `Cập nhật ${ids.length} sản phẩm thành dừng hoạt động`);
            break;
        //xóa nhiều
        case "delete-all":
            await Product.updateMany({_id: {$in: ids}},{$set: {
                deleted: true,
                deletedBy:{
                    account_id: res.locals.user.id,
                    deletedAt: new Date()
                },
                $push: {updatedBy: updatedBy}
            }});
            req.flash('success', `đã xóa ${ids.length} sản phẩm`);
            break;
        case "change-position":
            for(item of ids){
                let [id,position] = item.split("-");
                position=parseInt(position);
                await Product.updateOne({_id: {$in: id}},{$set: {position: position},$push: {updatedBy: updatedBy}});
            }
            // await Product.updateMany({_id: {$in: ids}},{$set: {status: "inactive"}});
            req.flash('success', `Cập nhật vị trí cho ${ids.length} sản phẩm thành công`);
            break;
        default:
            break;
    }
   res.redirect(req.get("Referer")||"/admin/products");
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteProduct = async (req,res) => {
    try {
        const id = req.params.id;
        await Product.updateOne({_id: id},{
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        });
        req.flash('success', `xóa thành công`);
    } catch (error) {
        req.flash('error', `xóa thất bại`);
    }
    res.redirect(req.get("Referer") || `${systemConfig.prefixAdmin}/products`);
};

//[GET] /admin/products/create
module.exports.create = async (req,res) => {
    const records = await ProductCategory.find({deleted: false}).lean();
    const newRecords = createTreeHelper.tree(records);
    res.render("admin/pages/products/create",{
        pageTitle: "Tạo sản phẩm",
        records: newRecords
    })
};
//[POST] /admin/products/create
module.exports.createPost = async (req,res) => {
    
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    if(req.body.position == ""){
        const countProducts = await Product.countDocuments()
        req.body.position = countProducts + 1;
    }else{
       req.body.position = parseInt(req.body.position);
    }

    const user = res.locals.user;
    req.body.createdBy = {
        account_id: user.id
    };
    // cú pháp tạo mới
    const product = new Product(req.body);
    await product.save();
    console.log(req.body)
    res.redirect(`${systemConfig.prefixAdmin}/products`);
};
//[GET] /admin/products/edit/:id
module.exports.edit = async (req,res) => {
    try {
        const id = req.params.id;
        const find ={
            deleted: false,
            _id: id
        };
        const product = await Product.findOne(find);
        const records = await ProductCategory.find({deleted: false}).lean();
        const newRecords = createTreeHelper.tree(records);
        res.render("admin/pages/products/edit",{
            pageTitle: "Sửa sản phẩm",
            product: product,
            records: newRecords
        });
    } catch (error) {
        req.flash("error","không tồn tại sản phẩm");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
};
//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req,res) => {
    const id = req.params.id;
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);
    //cú pháp patch
    try {
        const updatedBy = {
            account_id: res.locals.user.id,
            updatedAt: new Date()
        };
        await Product.updateOne({_id: id},{...req.body, $push: {updatedBy: updatedBy}});

        req.flash("success","cập nhật thành công");
    } catch (error) {
        req.flash("error","cập nhật thất bại");
    }

    res.redirect(`${systemConfig.prefixAdmin}/products`);
};
module.exports.detail = async (req,res) => {
    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };

        const product = await Product.findOne(find);
        res.render("admin/pages/products/detail",{
            pageTitle: product.title,
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}