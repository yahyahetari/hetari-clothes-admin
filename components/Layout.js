import { useSession, signIn } from "next-auth/react";
import Nav from "./Nav";
import TopBar from "./TopBar";
import { useMediaQuery } from "react-responsive";
import Loader from "./Loader";
import React, { useRef } from "react";

// Google Icon Component
function GoogleIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
  );
}
export default function Layout({ children }) {
  const { data: session } = useSession();
  const loading = session === undefined;
  const mainRef = useRef(null);

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Define media queries for screen size
  const isMobileOrLess = useMediaQuery({ query: '(max-width: 815px)' });
  if (loading) {
    return (
        <div className="flex justify-center items-center bg-bg-img bg-cover h-screen bg-glass">
            <Loader />
        </div>
    );
}

  if (!session) {
    return (
      <div className="flex items-center justify-center  bg-bg-img bg-cover min-h-screen bg-glass" >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1 rounded-2xl shadow-5xl">
          <div className="bg-glass p-8 rounded-xl">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Welcome</h2>
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center w-full bg-white text-gray-700 font-semibold py-3 px-6 rounded-full border border-gray-300 hover:bg-gray-100 hover:shadow-md transition-all duration-300"
            >
              <GoogleIcon className="w-6 h-6 mr-2" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white bg-bg-img bg-cover min-h-screen bg-glass overflow-hidden">
      {isMobileOrLess && <TopBar />} {/* Show TopBar on mobile or less */}
      <div className="flex">
        {!isMobileOrLess && <Nav />} {/* Show Nav on larger screens */}
        <main 
          ref={mainRef}
          className={`flex-grow m-2 w-54 p-4 ${isMobileOrLess ? 'ml-2 h-[500px]' : 'ml-64 '} rounded-lg bg-glass h-[600px] overflow-y-auto w-54 custom-scrollbar`}
        >
          {React.cloneElement(children, { scrollToTop })}
        </main>
      </div>
    </div>
  );
}
