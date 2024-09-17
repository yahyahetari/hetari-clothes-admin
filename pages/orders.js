import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import Loader from "@/components/Loader";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleOrderClick = async (orderId) => {
        try {
            await axios.post('/api/updateOrderView', { orderId });
            setOrders(orders.map(order => 
                order._id === orderId ? { ...order, viewed: true } : order
            ));
            router.push(`/order/${orderId}`);
        } catch (error) {
            console.error("Error updating order view status:", error);
        }
    };

    const calculateTotal = (lineItems) => {
        return lineItems.reduce((total, item) => {
            const unitAmount = item.price_data?.unit_amount || item.unit_amount || 0;
            const quantity = item.quantity || 1;
            return total + (unitAmount * quantity) / 100;
        }, 0);
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-200">Orders</h1>
            <input 
                type="text" 
                placeholder="Search Orders..." 
                className="mb-4 p-2 rounded-lg border text-xl" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="overflow-x-auto bg-glass shadow-lg rounded-lg">
                <div className="inline-block min-w-full">
                    <div className="overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-gray-200 bg-glass text-left text-lg font-semibold text-gray-300 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-5 py-3 border-gray-200 bg-glass text-left text-lg font-semibold text-gray-300 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-5 py-3 border-gray-200 bg-glass text-left text-lg font-semibold text-gray-300 uppercase tracking-wider">
                                        Products
                                    </th>
                                    <th className="px-5 py-3 border-gray-200 bg-glass text-left text-lg font-semibold text-gray-300 uppercase tracking-wider">
                                        Total ($)
                                    </th>
                                    <th className="px-5 py-3 border-gray-200 bg-glass text-left text-lg font-semibold text-gray-300 uppercase tracking-wider">
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-glass items-center justify-center">
                                        <td className="px-5 py-5 border-gray-200 text-lg flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleOrderClick(order._id);
                                                }}
                                                className="text-blue-300 hover:text-red-800 hover:font-bold"
                                            >
                                                {order._id}
                                            </a>
                                            {!order.viewed && (
                                                <span className="ml-2 text-sm text-red-500 font-bold">New</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-5 border-gray-200 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                                            {order.firstName} {order.lastName}
                                        </td>
                                        <td className="px-5 py-5 border-gray-200 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                                            {order.line_items.reduce((total, item) => total + item.quantity, 0)}
                                        </td>
                                        <td className="px-5 py-5 border-gray-200 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                                            ${calculateTotal(order.line_items).toFixed(2)}
                                        </td>
                                        <td className="px-5 py-5 border-gray-200 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-between mt-4">
                <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1} 
                    className="bg-h-glass text-white px-4 py-2 rounded disabled:bg-glass">
                    Previous Page
                </button>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages} 
                    className="bg-h-glass text-white px-4 py-2 rounded disabled:bg-glass">
                    Next Page
                </button>
            </div>
        </div>
    );
}
