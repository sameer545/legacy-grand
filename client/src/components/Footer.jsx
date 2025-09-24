import React from "react";
import { Link } from "react-router-dom";
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaGoogle
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      {/* Google Reviews Section - Only Button */}
      <div className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <a
              href="https://www.google.com/search?q=Hotel+Legacy+Grand+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] px-6 py-3 rounded-full font-semibold hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
            >
              <FaGoogle />
              View All Reviews
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Hotel Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">Hotel Legacy Grand</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Experience luxury and comfort at Hotel Legacy Grand. Located in the heart of the city, 
                we offer world-class amenities, exceptional service, and unforgettable experiences 
                for both business and leisure travelers.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">
                     6th Floor, Plot No: 25, 40, Babukhan Ln, near AIG Hospital, P Janardhan Reddy Nagar, Gachibowli, Hyderabad, Telangana 500032
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">+91 9985997755</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-[#D4AF37] flex-shrink-0" />
                  <span className="text-gray-300 text-sm">info@legacygrand.com</span>
                </div>
                  <div className="flex items-center gap-3">
                <Link
    to="https://mail.google.com/mail/?view=cm&fs=1&to=abdull.sameerr@gmail.com&su=Legacy%20Grand%20Website%20Inquiry,"
    className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
    target="_blank"
    rel="noopener noreferrer"
  >
    Contact Developer
  </Link>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {[
                  { name: "Home", path: "/" },
                  { name: "Rooms", path: "/rooms" },
                  { name: "Gallery", path: "/gallery" },
                  { name: "About", path: "/about" },
                  { name: "Contact", path: "/contact" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-[#D4AF37] mb-4">Services</h3>
              <ul className="space-y-2">
                {[
                  "Luxury Accommodation",
                  "Fine Dining",
                  "Conference Rooms",
                  "Valet Parking",
                  "24/7 Concierge"
                ].map((service) => (
                  <li key={service} className="text-gray-300 text-sm">
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media & Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              
              {/* Social Media */}
              <div className="flex items-center gap-4">
                <span className="text-gray-300 text-sm">Follow us:</span>
                <div className="flex gap-3">
                  {[
                    { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
                    { icon: FaTwitter, href: "https://twitter.com", label: "Twitter" },
                    { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                    { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" }
                  ].map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 p-2 rounded-full hover:bg-gray-800"
                      aria-label={social.label}
                    >
                      <social.icon className="text-lg" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Copyright */}
              <div className="text-center sm:text-right">
                <p className="text-gray-300 text-sm">
                  &copy; {new Date().getFullYear()} Hotel Legacy Grand. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Schema Script */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Hotel",
          "name": "Hotel Legacy Grand",
          "description": "Luxury hotel in the heart of the city with world-class amenities and exceptional service",
          "url": "https://legacygrand.com",
          "telephone": "+91-9985997755",
          "email": "info@legacygrand.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "6th Floor, Plot No: 25, 40, Babukhan Ln, near AIG Hospital, P Janardhan Reddy Nagar, Gachibowli, Hyderabad, Telangana 500032",
            "addressLocality": "Hyderabad",
            "addressRegion": "Telangana",
            "postalCode": "500032",
            "addressCountry": "IN"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": "17.442013700000004",
            "longitude": "78.3675008"
          },
          "amenityFeature": [
            { "@type": "LocationFeatureSpecification", "name": "Free WiFi" },
            { "@type": "LocationFeatureSpecification", "name": "Valet Parking" },
            { "@type": "LocationFeatureSpecification", "name": "24/7 Concierge" }
          ],
          "priceRange": "1800",
          "starRating": {
            "@type": "Rating",
            "ratingValue": "5"
          }
        })}
      </script>
    </footer>
  );
};

export default Footer;
