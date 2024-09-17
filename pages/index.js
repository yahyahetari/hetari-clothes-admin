import Loader from "@/components/Loader";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaDollarSign, FaChartLine, FaUsers, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';

export default function Home() {
   const [stats, setStats] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const response = await axios.get('/api/dashboard-stats');
            setStats(response.data);
         } catch (error) {
            console.error("Error fetching stats:", error);
         } finally {
            setLoading(false);
         }
      };

      fetchStats();
   }, []);

   if (loading) {
      return (
          <div className="flex justify-center items-center h-screen">
              <Loader />
          </div>
      );
  }

   const gradients = [
      ['#0D9488', '#000000'],
      ['#2D3748', '#000000'],
      ['#514A9D', '#000000'],
      ['#B45309', '#000000'],
      ['#870000', '#000000'],
      ['#004d3d', '#000000'],
   ];

   const StatCard = ({ title, value, icon, gradient }) => (
      <div className={`rounded-lg shadow-lg p-7 h-full flex flex-col justify-between`} style={{
         background: `linear-gradient(to right, ${gradient[0]}, ${gradient[1]})`
      }}>
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
            {icon}
         </div>
         <p className="text-3xl font-bold text-gray-100">{value}</p>
      </div>
   );

   return (
      <div className="container mx-auto px-4 py-8 pb-16 min-h-screen">
         <h1 className="text-3xl font-bold mb-8 text-gray-200">Dashboard</h1>
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatCard
               title="Total Revenue"
               value={`$${stats.totalRevenue?.toFixed(2) || '0.00'}`}
               icon={<FaDollarSign className="text-3xl text-teal-600" />}
               gradient={gradients[0]}
            />
            <StatCard
               title="Total Orders"
               value={stats.totalOrders}
               icon={<FaClipboardList className="text-3xl text-zinc-500" />}
               gradient={gradients[1]}
            />
            <StatCard
               title="Customers"
               value={stats.uniqueCustomers}
               icon={<FaUsers className="text-3xl text-purple-400" />}
               gradient={gradients[2]}
            />
            <StatCard
               title="This Month"
               value={`$${stats.thisMonthRevenue?.toFixed(2) || '0.00'}`}
               icon={<FaChartLine className="text-3xl text-yellow-400" />}
               gradient={gradients[3]}
            />
            <StatCard
               title="Last Month"
               value={`$${stats.lastMonthRevenue?.toFixed(2) || '0.00'}`}
               icon={<FaChartLine className="text-3xl text-red-400" />}
               gradient={gradients[4]}
            />
            <StatCard
               title="Total Profit"
               value={`$${stats.totalProfit?.toFixed(2) || '0.00'}`}
               icon={<FaMoneyBillWave className="text-3xl text-green-600" />}
               gradient={gradients[5]}
            />
         </div>
      </div>
   );
}
