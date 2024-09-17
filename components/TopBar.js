import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { LayoutGridIcon, LogOut, Menu, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import axios from "axios";

const navLinks = [
  { url: "/", label: "Dashboard", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { url: "/products", label: "Products", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg> },
  { url: "/categories", label: "Categories", icon: <LayoutGridIcon className="w-6 h-6" /> },
  { url: "/orders", label: "Orders", icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg> },
  { url: "/customers", label: "Customers", icon: <UserCircle2 className="w-6 h-6" /> },
];

export default function TopBar() {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const { pathname } = useRouter();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [hasNewOrders, setHasNewOrders] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      setDropdownMenu(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/deleteUser", {
        method: "DELETE",
      });

      if (response.ok) {
        await signOut({ callbackUrl: "/" });
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        const orders = response.data;

        const newOrders = orders.filter(order => !order.viewed);
        setNewOrdersCount(newOrders.length);
        setHasNewOrders(newOrders.length > 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuClick = () => {
    setDropdownMenu(!dropdownMenu);
    if (hasNewOrders) {
      setHasNewOrders(false);
    }
  };

  return (
    <div className="sticky top-0 z-20 w-full flex items-center px-4 py-2 bg-blue-2 shadow-xl">
      <Image src="/logo.png" alt="logo" width={90} height={30} />

      <div className="lg:hidden relative ml-auto flex gap-4 items-center">
        <div className="relative">
          <Menu className="cursor-pointer" onClick={handleMenuClick} />
          {hasNewOrders && (
            <span className="absolute -top-1 -right-0.5 bg-red-500 text-white text-base font-bold rounded-full h-4 w-4  flex items-center justify-center">
              {newOrdersCount}
            </span>
          )}
        </div>
        {dropdownMenu && (
          <div className="absolute top-12 right-0 flex flex-col gap-8 p-5 bg-glass shadow-xl rounded-lg">
            {navLinks.map((link) => (
              <Link 
                href={link.url} 
                key={link.label} 
                className={`flex gap-4 text-body-medium ${pathname === link.url ? "rounded-lg bg-glass flex text-lg items-center font-semibold p-2" : "text-grey-1"}`} 
              >
                {link.icon}
                <p>{link.label}</p>
                {link.label === "Orders" && newOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ml-2">
                    {newOrdersCount}
                  </span>
                )}
              </Link>
            ))}
            <button 
              onClick={handleLogout}
              className="flex gap-4 text-body-medium text-grey-1 cursor-pointer"
            >
              <LogOut className="w-6 h-6" />
              <p>Logout</p>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
