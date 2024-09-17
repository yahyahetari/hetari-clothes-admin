import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Products";

export default async function handler(req, res) {
    await mongooseConnect();
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const stats = await Order.aggregate([
            {
                $facet: {
                    "totalOrders": [{ $count: "count" }],
                    "totalRevenue": [
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $reduce: {
                                            input: "$line_items",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    { $multiply: [{ $toInt: "$$this.quantity" }, { $divide: [{ $toInt: "$$this.price_data.unit_amount" }, 100] }] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "thisMonthRevenue": [
                        { $match: { createdAt: { $gte: firstDayOfMonth } } },
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $reduce: {
                                            input: "$line_items",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    { $multiply: [{ $toInt: "$$this.quantity" }, { $divide: [{ $toInt: "$$this.price_data.unit_amount" }, 100] }] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "lastMonthRevenue": [
                        { $match: { createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfMonth } } },
                        {
                            $group: {
                                _id: null,
                                total: {
                                    $sum: {
                                        $reduce: {
                                            input: "$line_items",
                                            initialValue: 0,
                                            in: {
                                                $add: [
                                                    "$$value",
                                                    { $multiply: [{ $toInt: "$$this.quantity" }, { $divide: [{ $toInt: "$$this.price_data.unit_amount" }, 100] }] }
                                                ]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    "uniqueCustomers": [
                        { $group: { _id: "$email" } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        // Calculate total profit
        const orders = await Order.find({}, 'line_items');
        let totalProfit = 0;

        for (const order of orders) {
            for (const item of order.line_items) {
                const product = await Product.findOne({ title: item.price_data.product_data.name });
                if (product) {
                    const itemProfit = (item.price_data.unit_amount / 100 - product.cost) * item.quantity;
                    totalProfit += itemProfit;
                }
            }
        }

        const result = {
            totalOrders: stats[0].totalOrders[0]?.count || 0,
            totalRevenue: parseFloat((stats[0].totalRevenue[0]?.total || 0).toFixed(2)),
            thisMonthRevenue: parseFloat((stats[0].thisMonthRevenue[0]?.total || 0).toFixed(2)),
            lastMonthRevenue: parseFloat((stats[0].lastMonthRevenue[0]?.total || 0).toFixed(2)),
            uniqueCustomers: stats[0].uniqueCustomers[0]?.count || 0,
            totalProfit: parseFloat(totalProfit.toFixed(2))
        };

        res.json(result);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
