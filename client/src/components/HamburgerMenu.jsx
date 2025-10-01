import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import LogoutButton from "./LogoutButton";
import { 
  FaHome, 
  FaBed, 
  FaImages, 
  FaInfoCircle, 
  FaPhone,
  FaCalendarCheck,
  FaTachometerAlt,
  FaUser,
  FaSignInAlt
} from "react-icons/fa";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, role } = useAppContext();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { 
      label: 'Home', 
      hash: '#hero', 
      icon: FaHome,
      action: () => {
        closeMenu();
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      }
    },
    { 
      label: 'Rooms', 
      hash: '#rooms', 
      icon: FaBed,
      action: () => {
        closeMenu();
        setTimeout(() => {
          const element = document.querySelector('#rooms');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    { 
      label: 'Gallery', 
      hash: '#gallery', 
      icon: FaImages,
      action: () => {
        closeMenu();
        setTimeout(() => {
          const element = document.querySelector('#gallery');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    { 
      label: 'About', 
      hash: '#about', 
      icon: FaInfoCircle,
      action: () => {
        closeMenu();
        setTimeout(() => {
          const element = document.querySelector('#about');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    },
    { 
      label: 'Contact', 
      hash: '#contact', 
      icon: FaPhone,
      action: () => {
        closeMenu();
        setTimeout(() => {
          const element = document.querySelector('#contact');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  ];

  return (
    <div className="lg:hidden">
      {/* Hamburger Button - Fixed position, consistent across all sections - Mobile/Tablet only */}
      <button
        onClick={toggleMenu}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-lg ${
          isOpen 
            ? 'bg-[#D4AF37] hover:bg-yellow-400' 
            : 'bg-black/80 backdrop-blur-sm hover:bg-black/90 border border-[#D4AF37]/30'
        }`}
        aria-label="Toggle menu"
        style={{ zIndex: 9999 }}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span
            className={`block h-0.5 w-full transform transition-all duration-300 ${
              isOpen 
                ? 'rotate-45 translate-y-0 bg-black' 
                : 'rotate-0 -translate-y-1.5 bg-[#D4AF37]'
            }`}
          ></span>
          <span
            className={`block h-0.5 w-full transform transition-all duration-300 ${
              isOpen 
                ? 'opacity-0 bg-black' 
                : 'opacity-100 translate-y-0 bg-[#D4AF37]'
            }`}
          ></span>
          <span
            className={`block h-0.5 w-full transform transition-all duration-300 ${
              isOpen 
                ? '-rotate-45 translate-y-0 bg-black' 
                : 'rotate-0 translate-y-1.5 bg-[#D4AF37]'
            }`}
          ></span>
        </div>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isOpen ? 'opacity-100 visible z-40' : 'opacity-0 invisible z-40'
        }`}
        onClick={closeMenu}
        style={{ zIndex: 9998 }}
      ></div>

      {/* Menu Panel - Half page width */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 min-w-80 max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-800 shadow-2xl transform transition-transform duration-300 ease-out border-l border-[#D4AF37]/20 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        {/* Menu Header */}
        <div className="p-6 border-b border-[#D4AF37]/30 bg-black/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#D4AF37]">Navigation</h2>
              <p className="text-gray-400 text-sm mt-1">Legacy Grand Hotel</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-6">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={item.action}
                  className="flex items-center w-full py-4 px-4 text-left text-white hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-300 border-l-2 border-transparent hover:border-[#D4AF37] group"
                >
                  <item.icon className="w-5 h-5 mr-3 transition-colors" />
                  <span className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-200">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}

            {/* Authentication Section */}
            {isLoggedIn ? (
              <>
                {/* Dashboard for Admin */}
                {role === "admin" && (
                  <li>
                    <Link
                      to="/admin"
                      onClick={closeMenu}
                      className="flex items-center w-full py-4 px-4 text-left text-white hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-300 border-l-2 border-transparent hover:border-[#D4AF37] group"
                    >
                      <FaTachometerAlt className="w-5 h-5 mr-3 transition-colors" />
                      <span className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-200">
                        Dashboard
                      </span>
                    </Link>
                  </li>
                )}

                {/* My Bookings for Regular Users Only */}
                {role !== "admin" && (
                  <li>
                    <Link
                      to="/my-bookings"
                      onClick={closeMenu}
                      className="flex items-center w-full py-4 px-4 text-left text-white hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-300 border-l-2 border-transparent hover:border-[#D4AF37] group"
                    >
                      <FaUser className="w-5 h-5 mr-3 transition-colors" />
                      <span className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-200">
                        My Bookings
                      </span>
                    </Link>
                  </li>
                )}

                {/* Logout */}
                <li>
                  <div className="flex items-center w-full py-4 px-4 text-left text-red-400 hover:text-red-300 hover:bg-white/5 rounded-lg transition-all duration-300 border-l-2 border-transparent hover:border-red-400 group">
                    <LogoutButton />
                  </div>
                </li>
              </>
            ) : (
              /* Login Link for Non-authenticated Users */
              <li>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center w-full py-4 px-4 text-left text-white hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-all duration-300 border-l-2 border-transparent hover:border-[#D4AF37] group"
                >
                  <FaSignInAlt className="w-5 h-5 mr-3 transition-colors" />
                  <span className="text-lg font-medium group-hover:translate-x-1 transition-transform duration-200">
                    Login
                  </span>
                </Link>
              </li>
            )}
            
            {/* Book Now Button */}
            <li className="mt-6">
              <Link
                to="/rooms"
                onClick={closeMenu}
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#D4AF37] to-yellow-500 text-black px-6 py-4 rounded-full font-semibold hover:from-yellow-400 hover:to-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FaCalendarCheck className="w-5 h-5 mr-2" />
                Book Now
              </Link>
            </li>
          </ul>
        </nav>

        {/* Menu Footer */}
        <div className="p-6 border-t border-[#D4AF37]/30 bg-black/30">
          <div className="text-center space-y-3">
            <div className="text-[#D4AF37] font-semibold text-lg">Hotel Legacy Grand</div>
            <div className="text-gray-400 text-sm italic">Experience Luxury Like Never Before</div>
            
            {/* Contact Icons */}
            <div className="flex justify-center space-x-6 pt-4">
              <a
                href="tel:+91 9985997755"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors p-2 rounded-full hover:bg-white/5"
                title="Call us"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </a>
              <a
                href="mailto:bookings@legacygrandhotel.com"
                className="text-gray-400 hover:text-[#D4AF37] transition-colors p-2 rounded-full hover:bg-white/5"
                title="Email us"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
              <button
                onClick={() => {
                  closeMenu();
                  setTimeout(() => {
                    const element = document.querySelector('#contact');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="text-gray-400 hover:text-[#D4AF37] transition-colors p-2 rounded-full hover:bg-white/5"
                title="Our location"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;