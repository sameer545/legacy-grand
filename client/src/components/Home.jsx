import React, { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { 
  FaWifi, 
  FaTv, 
  FaSnowflake, 
  FaAirbnb, 
  FaShower, 
  FaCar,
  FaConciergeBell,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarCheck,
  FaWhatsapp 
} from "react-icons/fa";
import axios from "axios";
import { getGalleryImages } from "../api-client";
import heroImage from "../assets/hero.jpg";
import HamburgerMenu from "./HamburgerMenu";

// Lazy load components
const RoomCard = lazy(() => import("../components/RoomCard"));

const API_BASE = process.env.REACT_APP_API_BASE_URL;

// Gallery preview component
const GalleryPreview = () => {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Room types to fetch gallery images from
  const roomTypes = [
    "standard-family-room",
    "luxury-studio-room", 
    "balcony-view-room",
    "legacy-suite",
    "surroundings"
  ];

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const allImages = [];
        
        // Fetch images from each room type
        for (const roomType of roomTypes) {
          try {
            const images = await getGalleryImages(roomType);
            const imageArray = Array.isArray(images) ? images : images?.images ?? [];
            // Take first 2 images from each room type to create a diverse preview
            allImages.push(...imageArray.slice(0, 2));
          } catch (err) {
            console.error(`Failed to fetch images for ${roomType}:`, err);
          }
        }

        // Shuffle and limit to 8 images for preview
        const shuffled = allImages.sort(() => 0.5 - Math.random());
        setGalleryImages(shuffled.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
        setGalleryImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  const openImage = (image, index) => {
    setSelectedImage({ image, index });
  };

  const closeImage = () => {
    setSelectedImage(null);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    const nextIndex = (selectedImage.index + 1) % galleryImages.length;
    setSelectedImage({ image: galleryImages[nextIndex], index: nextIndex });
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    const prevIndex = selectedImage.index === 0 ? galleryImages.length - 1 : selectedImage.index - 1;
    setSelectedImage({ image: galleryImages[prevIndex], index: prevIndex });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') closeImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!galleryImages.length) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📸</div>
        <p className="text-gray-400">Gallery images will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {galleryImages.map((image, index) => (
          <div 
            key={`gallery-${index}`}
            className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer"
            onClick={() => openImage(image, index)}
          >
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeImage}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImage}
              className="absolute -top-12 right-0 text-[#D4AF37] hover:text-white text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors z-10"
              title="Close (Esc)"
            >
              ✕
            </button>
            
            <img
              src={selectedImage.image}
              alt={`Gallery full ${selectedImage.index + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl border border-[#D4AF37]/30"
            />
            
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-white text-4xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                  title="Previous (←)"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37] hover:text-white text-4xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                  title="Next (→)"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#D4AF37] text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedImage.index + 1} / {galleryImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/rooms`);
        const roomsData = res.data;

        const roomsWithImages = await Promise.all(
          roomsData.map(async (room) => {
            try {
              const imgs = await getGalleryImages(room.name);
              return { ...room, images: imgs || [] };
            } catch {
              return { ...room, images: [] };
            }
          })
        );

        setRooms(roomsWithImages);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Add the HamburgerMenu component here */}
      <HamburgerMenu />

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Hotel Legacy Grand"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-[#D4AF37] leading-tight">
            Hotel Legacy Grand
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-200 font-light tracking-wide max-w-2xl mx-auto">
            Experience Luxury Like Never Before in the Heart of the City
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rooms"
              className="bg-[#D4AF37] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </Link>
            <a
              href="#rooms"
              className="border-2 border-[#D4AF37] text-[#D4AF37] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              Explore Rooms
            </a>
              {/* Airbnb Icon Button */}
  <a
    href="https://www.airbnb.co.in/rooms/1480352371543048808?source_impression_id=p3_1758664997_P3NnBysGkh3WEJHa"
    target="_blank"
    rel="noopener noreferrer"
    className="border-2 border-[#D4AF37] text-[#D4AF37] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
  >
    <FaAirbnb className="text-xl" />
    Airbnb
  </a>

  {/* Bookings Icon Button */}
  <a
    href="https://www.booking.com/hotel/in/legacy-grand-rooms-amp-suites-near-aig-hospital.html?aid=1288252&label=metagha-link-LUIN-hotel-14740818_dev-desktop_los-1_bw-25_dow-Sunday_defdate-1_room-0_gstadt-2_rateid-0_aud-0_gacid-21411129971_mcid-10_ppa-0_clrid-0_ad-1_gstkid-0_checkin-20251019_ppt-_lp-2356_r-12298840666056869047&sid=9d4f78cc9e810baeaa5853e7f5f14022&all_sr_blocks=1474081804_418784858_2_0_0&checkin=2025-10-19&checkout=2025-10-20&dest_id=14740818&dest_type=hotel&dist=0&group_adults=2&group_children=0&hapos=1&highlighted_blocks=1474081804_418784858_2_0_0&hpos=1&matching_block_id=1474081804_418784858_2_0_0&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=1474081804_418784858_2_0_0__179900&srepoch=1758664909&srpvid=6d719ae155b60c4d&type=total&ucfs=1&"
    target="_blank"
    rel="noopener noreferrer"
    className="border-2 border-[#D4AF37] text-[#D4AF37] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full hover:bg-[#D4AF37] hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
  >
    <FaCalendarCheck className="text-xl" />
    Bookings
  </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#D4AF37] rounded-full flex justify-center">
            <div className="w-1 h-3 bg-[#D4AF37] rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-4">
              Our Luxurious Rooms
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of rooms, each designed to provide the ultimate comfort and elegance
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl h-64 sm:h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              <Suspense fallback={<div className="bg-gray-800 rounded-xl h-64 sm:h-80 animate-pulse"></div>}>
                {rooms.slice(0, 4).map((room) => (
                  <RoomCard key={room._id} room={room} />
                ))}
              </Suspense>
            </div>
          )}

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/rooms"
              className="inline-block bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              View All Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-12 sm:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-4">
              Amenities
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Experience unparalleled luxury with our premium facilities and services
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: FaWifi, title: "Free WiFi", desc: "High-speed internet" },
              { icon: FaCar, title: "Valet Parking", desc: "Complimentary parking" },
              { icon: FaShower, title: "Private Bath", desc: "Clean Bathrooms" },
              { icon: FaConciergeBell, title: "24/7 Concierge", desc: "Round-the-clock service" },
              { icon: FaTv, title: "Smart TV", desc: "Premium entertainment" },
              { icon: FaSnowflake, title: "Climate Control", desc: "Perfect temperature" }
            ].map((amenity, index) => (
              <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="bg-[#D4AF37] w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-yellow-400 transition-colors">
                  <amenity.icon className="text-black text-lg sm:text-2xl lg:text-3xl" />
                </div>
                <h3 className="font-semibold text-white text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">{amenity.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{amenity.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section id="gallery" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-4">
              Gallery
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Take a virtual tour through our beautiful spaces and amenities
            </p>
          </div>

          <GalleryPreview />

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/gallery"
              className="inline-block bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-4 sm:mb-6">
                About Legacy Grand
              </h2>
              <div className="space-y-3 sm:space-y-4 text-gray-300">
                <p className="text-base sm:text-lg leading-relaxed">
                  Welcome to <strong className="text-[#D4AF37]">Legacy Grand</strong>, located in Gachibowli, Hyderabad, Legacy Grand offers
          comfortable, air-conditioned rooms that can be upgraded into spacious suites with private
          balconies. Just minutes from AIG Hospital, Deloitte, and Hi-Tech City, we'are ideal for business
          travelers, medical visitors, and short getaways. Guests also enjoy access to our open terrace - a
          peaceful spot to relax after a busy day.
                </p>
                <p className="text-base sm:text-lg leading-relaxed">
                  At Legacy Grand, we don't just provide a stay. We deliver a legacy of unforgettable moments.
                </p>
              </div>
              <Link
                to="/about"
                className="inline-block mt-6 sm:mt-8 bg-[#D4AF37] text-black px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
            
            <div className="order-1 lg:order-2">
              <img
                src="https://picsum.photos/600/400?random=hotel"
                alt="Hotel Legacy Grand Interior"
                className="w-full rounded-lg shadow-xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#D4AF37] mb-4">
              Contact Us
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              Get in touch with us for reservations and inquiries
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-[#D4AF37] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaMapMarkerAlt className="text-black text-lg sm:text-2xl" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Address</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                6th Floor, Plot No: 25, 40<br />
                Babukhan Ln<br />
                P Janardhan Reddy Nagar, Gachibowli, Hyderabad 500032
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#D4AF37] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaPhone className="text-black text-lg sm:text-2xl" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Phone</h3>
<p className="text-gray-400 text-sm sm:text-base flex items-center justify-center gap-2">
    <FaWhatsapp className="text-green-500 text-lg sm:text-xl" />
    <a
      href="https://wa.me/919985997755"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-[#25D366] transition-colors"
    >
      +91 9985997755
    </a>
  </p>
  <p className="text-gray-400 text-sm sm:text-base">
    +91 9989119083
  </p>
</div>

            <div className="text-center sm:col-span-2 lg:col-span-1">
              <div className="bg-[#D4AF37] w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FaEnvelope className="text-black text-lg sm:text-2xl" />
              </div>
              <h3 className="font-semibold text-white text-base sm:text-lg mb-2">Email</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                info@legacygrand.com<br />
                reservations@legacygrand.com
              </p>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/contact"
              className="inline-block bg-[#D4AF37] text-black px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;