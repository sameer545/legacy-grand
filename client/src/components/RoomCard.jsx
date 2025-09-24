import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaWifi,
  FaTv,
  FaSnowflake,
  FaUtensils,
  FaShower,
} from "react-icons/fa";

const RoomCard = ({ room }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    if (room.images && room.images.length > 0) {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="group relative bg-black/60 border border-[#bfa44250] rounded-xl overflow-hidden shadow-md backdrop-blur-lg transition-transform hover:scale-[1.02] hover:shadow-[0_0_20px_#bfa442aa] duration-300">
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.roomType || room.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            onClick={handleImageClick}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500 italic">
            No image available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Info Section */}
      <div className="p-5 text-[#bfa442]">
        <h3 className="text-2xl font-semibold mb-2 tracking-wide drop-shadow">
          {room.roomType || room.name}
        </h3>

        <p className="text-sm text-[#e5c97b] line-clamp-2 mb-4">
          {room.description}
        </p>

        {/* Amenities */}
        <div className="flex gap-4 text-[#e5c97b] text-lg mb-4">
          <FaWifi title="Free WiFi" className="hover:text-white transition" />
          <FaTv title="Smart TV" className="hover:text-white transition" />
          <FaSnowflake title="Air Conditioning" className="hover:text-white transition" />
          <FaUtensils title="Room Service" className="hover:text-white transition" />
          <FaShower title="Private Bath" className="hover:text-white transition" />
        </div>

        {/* Price */}
        {room.price && (
          <p className="font-semibold text-lg mb-4 drop-shadow">
            ₹ {room.price.toLocaleString()} / night
          </p>
        )}

        <Link
          to={`/room/${room._id}`}
          className="inline-block w-full text-center bg-gradient-to-r from-[#bfa442] to-[#e5c97b] text-black font-semibold py-2 rounded-md transition-all duration-300 hover:from-[#e5c97b] hover:to-[#bfa442]"
        >
          View Details
        </Link>
      </div>

      {/* Modal for viewing all images */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg max-w-5xl w-full overflow-auto max-h-[90vh] border border-yellow-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">
              {room.roomType || room.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {room.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${room.roomType || room.name} ${index + 1}`}
                  className="w-full h-48 object-cover rounded border border-yellow-600"
                />
              ))}
            </div>
            <div className="text-right mt-6">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded transition"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
