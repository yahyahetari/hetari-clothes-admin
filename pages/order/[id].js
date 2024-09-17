import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';
import { Box } from "lucide-react";

export default function Order() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchOrder = async () => {
            if (id) {
                try {
                    const response = await axios.get(`/api/orders/${id}`);
                    setOrder(response.data);
                } catch (error) {
                    setError(error.message || "An error occurred while fetching the order.");
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
                    <p className="font-bold">Order not found</p>
                    <p>ID: {id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-2">
            <h1 className="text-2xl font-medium mb-6 text-gray-200">Order Details</h1>
            <div className="bg-glass rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-300 text-xl">{order.createdAt.replace('T', ' / ').substring(0, 21)}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-200">Recipient Information</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center"><FaUser className="mr-2 text-blue-400" /> {order.firstName} {order.lastName}</li>
                            <li className="flex items-center"><FaEnvelope className="mr-2 text-blue-400" /> {order.email}</li>
                            <li className="flex items-center"><FaPhone className="mr-2 text-blue-400" /> {order.phone}</li>
                            <li className="flex items-center"><FaMapMarkerAlt className="mr-2 text-blue-400" /> {order.address} {order.address2}, {order.city}, {order.state} {order.postalCode}</li>
                            <li className="flex items-center"><FaGlobe className="mr-2 text-blue-400" /> {order.country}</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-200">Order Summary</h3>
                        <ul className="space-y-2">
                            {order.line_items && order.line_items.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <Box className="mr-2 mt-1 text-blue-400" />
                                    <div>
                                        <p className="font-semibold">{item.price_data?.product_data?.name}</p>
                                        <p className="text-lg text-gray-200">{item.price_data?.product_data?.description}</p>
                                        <p className="text-lg">Quantity: {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
