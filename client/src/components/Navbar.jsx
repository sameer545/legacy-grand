import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { isLoggedIn, role } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomePage = location.pathname === '/' || location.pathname === '/Home';

  const scrollToSection = (sectionId) => {
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (item) => {
    if (item.label === "Home") {
      // Always navigate to home page
      navigate('/');
      return;
    }

    if (isHomePage && item.sectionId) {
      // If on home page and has section ID, scroll to section
      scrollToSection(item.sectionId);
    } else {
      // Otherwise navigate to the page
      navigate(item.path);
    }
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Rooms",
      path: "/rooms",
      sectionId: "rooms"
    },
    {
      label: "Gallery",
      path: "/gallery",
      sectionId: "gallery"
    },
    {
      label: "About",
      path: "/about",
      sectionId: "about"
    },
    {
      label: "Contact",
      path: "/contact",
      sectionId: "contact"
    }
  ];

  return (
    <>
      <nav className={`navbar-container fixed top-0 w-full z-50 transition-all duration-300 hidden lg:block ${
        scrolled || !isHomePage
          ? 'bg-black/30 backdrop-blur-sm shadow-md'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo */}
            <Link
              to="/"
              className="text-sm sm:text-base md:text-lg font-bold text-[#D4AF37] hover:text-yellow-400 transition-colors duration-200 z-50 relative"
            >
              Hotel Legacy Grand
            </Link>

            {/* Desktop Navigation - Now always visible */}
            <div className="flex items-center space-x-6">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(item)}
                  className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all duration-200 group-hover:w-full"></span>
                </button>
              ))}

              {/* Authentication Links */}
              <div className="flex items-center space-x-3 border-l border-gray-600/50 pl-6">
                {isLoggedIn ? (
                  <>
                    {role === "admin" ? (
                      <Link
                        to="/admin"
                        className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/my-bookings"
                        className="text-white hover:text-[#D4AF37] text-sm font-medium transition-colors duration-200"
                      >
                        My Bookings
                      </Link>
                    )}
                    <div className="text-white hover:text-red-400 text-sm font-medium transition-colors duration-200 cursor-pointer">
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-yellow-400 transition-all duration-200 transform hover:scale-105"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar - only for desktop */}
      <div className="h-12 sm:h-14 hidden lg:block"></div>
    </>
  );
};

export default Navbar;