import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
    await mongooseConnect();
    try {
        const customers = await Order.aggregate([
            {
                $group: {
                    _id: "$email",
                    firstName: { $first: "$firstName" },
                    lastName: { $first: "$lastName" },
                    email: { $first: "$email" },
                    phone: { $first: "$phone" },
                    address: { $first: "$address" },
                    city: { $first: "$city" },
                    country: { $first: "$country" },
                    orderCount: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $reduce: {
                                input: "$line_items",
                                initialValue: 0,
                                in: {
                                    $add: [
                                        "$$value",
                                        {
                                            $multiply: [
                                                { $toInt: "$$this.quantity" },
                                                { $divide: [{ $toInt: "$$this.price_data.unit_amount" }, 100] }
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { orderCount: -1 } }
        ]);
        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
