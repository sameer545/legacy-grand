import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "./contexts/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SEOMeta from "./components/SEOMeta";
import "react-datepicker/dist/react-datepicker.css";

// Lazy load components for better performance
const Home = lazy(() => import("./components/Home"));
const Rooms = lazy(() => import("./pages/Rooms"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const RoomDetails = lazy(() => import("./pages/RoomDetails"));
const BookRoom = lazy(() => import("./pages/BookRoom"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Gallery = lazy(() => import("./pages/Gallery"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserBookings = lazy(() => import("./pages/UserBookings"));

// Create QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});



// Route-specific SEO component
const RouteSEO = () => {
  const location = useLocation();

  const getRouteSpecificSEO = () => {
    switch (location.pathname) {
      case "/":
        return {
          title: "Hotel Legacy Grand - Luxury 5-Star Hotel in Downtown | Premium Accommodation",
          description:
            "Experience unparalleled luxury at Hotel Legacy Grand. 5-star premium accommodation with world-class amenities, spa, fine dining, and exceptional service in the heart of the city.",
          keywords:
            "luxury hotel, 5-star hotel, premium accommodation, city center hotel, spa hotel, business hotel, wedding venue, conference facilities",
          canonical: "https://legacygrand.com",
        };
      case "/rooms":
        return {
          title: "Luxury Hotel Rooms & Suites - Hotel Legacy Grand | Book Premium Accommodation",
          description:
            "Discover our luxurious rooms and suites. From Standard Family Rooms to Presidential Suites, all featuring modern amenities, elegant design, and exceptional comfort.",
          keywords: "hotel rooms, luxury suites, accommodation booking, premium rooms, family rooms, business suites",
          canonical: "https://legacygrand.com/rooms",
        };
      case "/gallery":
        return {
          title: "Hotel Gallery - Photos of Rooms, Amenities & Facilities | Hotel Legacy Grand",
          description:
            "Explore our stunning photo gallery showcasing elegant rooms, world-class amenities, fine dining restaurants, spa facilities, and beautiful hotel interiors.",
          keywords: "hotel photos, gallery, rooms photos, hotel facilities, amenities photos, interior design",
          canonical: "https://legacygrand.com/gallery",
        };
      case "/about":
        return {
          title: "About Hotel Legacy Grand - Luxury Hospitality & Heritage | Our Story",
          description:
            "Learn about Hotel Legacy Grand's commitment to luxury hospitality, our heritage, exceptional service standards, and what makes us the preferred choice for discerning travelers.",
          keywords: "about hotel, hotel history, luxury hospitality, hotel heritage, service excellence",
          canonical: "https://legacygrand.com/about",
        };
      case "/contact":
        return {
          title: "Contact Hotel Legacy Grand - Reservations, Inquiries & Location | Get in Touch",
          description:
            "Contact Hotel Legacy Grand for reservations, inquiries, and assistance. Find our location, phone numbers, email addresses, and booking information.",
          keywords: "hotel contact, reservations, booking inquiries, hotel location, contact information",
          canonical: "https://legacygrand.com/contact",
        };
      default:
        return {
          title: "Hotel Legacy Grand - Luxury Accommodation",
          description: "Experience luxury and comfort at Hotel Legacy Grand.",
          canonical: `https://legacygrand.com${location.pathname}`,
        };
    }
  };

  return <SEOMeta {...getRouteSpecificSEO()} />;
};

// Component to handle automatic scroll to top on route change
const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }, [pathname]);

  return null;
};

// Scroll to top button component
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 bg-[#D4AF37] text-black p-3 rounded-full shadow-lg transition-all duration-300 z-50 hover:bg-yellow-400 hover:scale-110 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Scroll to top"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
};

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
  </div>
);

// Main App component
function App() {
  React.useEffect(() => {
    // Add performance monitoring
    if ("performance" in window) {
      window.addEventListener("load", () => {
        const perfData = performance.getEntriesByType("navigation")[0];
        if (perfData && perfData.loadEventEnd && perfData.loadEventStart) {
          const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
          if (loadTime > 0) {
            console.log("Page Load Time:", loadTime + "ms");
          }
        } else {
          // Fallback for older browsers
          const loadTime = performance.now();
          console.log("Time to interactive:", Math.round(loadTime) + "ms");
        }
      });
    }

    // Add service worker for better caching
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <Router>
            <div className="flex flex-col min-h-screen bg-black text-white">
              <RouteSEO />
              <ScrollToTopOnRouteChange />

              {/* Skip to main content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#D4AF37] text-black px-4 py-2 rounded z-50"
              >
                Skip to main content
              </a>

              <Navbar />

              <main id="main-content" className="flex-grow" role="main">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/room/:id" element={<RoomDetails />} />
                    <Route path="/book/:id" element={<BookRoom />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/my-bookings" element={<UserBookings />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
              <ScrollToTopButton />
            </div>
          </Router>
        </AppContextProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;