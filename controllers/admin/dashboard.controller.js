const CategoryProduct = require("../../models/product-category.model");
const Product = require("../../models/product.model");
const Account = require("../../models/account.model");
const User = require("../../models/user.model");
const Order = require("../../models/order.model");
const monthHelper = require("../../helpers/months");
// [GET] /admin/dashboard
module.exports.dashboard = async (req, res) => {
    const statistic = {
        categoryProduct: {
            total: 0,
            active: 0,
            inactive: 0
        },
        product: {
            total: 0,
            active: 0,
            inactive: 0
        },
        account: {
            total: 0,
            active: 0,
            inactive: 0
        },
        user: {
            total: 0,
            active: 0,
            inactive: 0
        }
    };

    statistic.categoryProduct.total = await CategoryProduct.countDocuments({deleted: false});
    statistic.categoryProduct.active = await CategoryProduct.countDocuments({deleted: false,status: "active"});
    statistic.categoryProduct.inactive = await CategoryProduct.countDocuments({deleted: false,status: "inactive"});

    statistic.product.total = await Product.countDocuments({deleted: false});
    statistic.product.active = await Product.countDocuments({deleted: false,status: "active"});
    statistic.product.inactive = await Product.countDocuments({deleted: false,status: "inactive"});

    statistic.account.total = await Account.countDocuments({deleted: false});
    statistic.account.active = await Account.countDocuments({deleted: false,status: "active"});
    statistic.account.inactive = await Account.countDocuments({deleted: false,status: "inactive"});

    statistic.user.total = await User.countDocuments({deleted: false});
    statistic.user.active = await User.countDocuments({deleted: false,status: "active"});
    statistic.user.inactive = await User.countDocuments({deleted: false,status: "inactive"});

    const bestSellerProduct = await Product.find({deleted: false}).sort({sold: -1}).limit(10).select("title sold thumbnail");
    console.log(bestSellerProduct);
    res.render("admin/pages/dashboard/index",{
        pageTitle:  "dashboard",
        statistic: statistic,
        bestSellerProduct: bestSellerProduct
    }
    )
}
module.exports.revenueCategory = async (req,res) => {
    const now = new Date();
    const filterValue = req.query.filter;
    const filterKey = {
        day: 1,
        week: 7,
        month: 30,
        quarter: 90
    };
    const startDate = new Date(now.setDate(now.getDate() - filterKey[filterValue]));

    const data = await Order.aggregate([
        {
            $match: {
                deleted: false,
                createdAt: {$gte: startDate}
            }
        },
        {
            $unwind: "$products"
        },
        {
            $addFields:{
                "products.product_id":{
                    $toObjectId: "$products.product_id"
                }
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "products.product_id",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        {
            $unwind: "$productInfo"
        },
        {
            $addFields:{
                "productInfo.product_category_id":{
                    $toObjectId: "$productInfo.product_category_id"
                }
            }
        },
        {
            $lookup: {
                from: "product-category",
                localField: "productInfo.product_category_id",
                foreignField: "_id",
                as: "categoryInfo"
            }
        },
        {
            $unwind: "$categoryInfo"
        },
        {
            $group:{
                _id: "$categoryInfo.title",
                revenue: {
                    $sum: {
                        $multiply: [
                            "$products.price",
                            "$products.quantity",
                            {
                                $subtract: [
                                    1,
                                    {$divide: ["$products.discountPercentage",100]}
                                ]
                            }
                        ]
                    }
                }
            }
        }
    ]);
    res.json({
        message: "200",
        data: data
    })
}
module.exports.revenueYear = async (req,res) => {
    try {
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 tháng gần nhất

        // Aggregate doanh thu theo tháng
        const revenueData = await Order.aggregate([
        { 
            $match: { createdAt: { $gte: sixMonthsAgo } } 
        },
        {
            $addFields: {
            totalAmount: {
                $sum: {
                $map: {
                    input: "$products",
                    as: "p",
                    in: { 
                    $multiply: ["$$p.price", "$$p.quantity", { $subtract: [1, { $divide: ["$$p.discountPercentage", 100] }] }] 
                    }
                }
                }
            }
            }
        },
        {
            $addFields: {
            totalAmount: { $subtract: ["$totalAmount", { $ifNull: ["$coupon.discountAmount", 0] }] }
            }
        },
        {
            $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Lấy nhãn tháng và dữ liệu
        const labels = monthHelper.months({ count: 6 }); // ["10/2025", "11/2025", ...]
        const dataMap = {};
        revenueData.forEach(r => {
        const key = `${r._id.month}/${r._id.year}`;
        dataMap[key] = r.revenue;
        });

        const dataValues = labels.map(l => dataMap[l] || 0);

        const data = {
            labels: labels,
            datasets: [{
                label: 'Doanh thu',
                data: dataValues,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };
        
        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Lỗi server" });
    }
}