import React from "react";
import { Link } from "react-router-dom";
import {
  FaWifi,
  FaTv,
  FaSnowflake,
  FaUtensils,
  FaShower,
} from "react-icons/fa";

const RoomCard = ({ room }) => {


  return (
    <div className="group relative bg-black/60 border border-[#bfa44250] rounded-xl overflow-hidden shadow-md backdrop-blur-lg transition-transform hover:scale-[1.02] hover:shadow-[0_0_20px_#bfa442aa] duration-300">
      {/* Image Section */}
      <div className="relative h-52 overflow-hidden">
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.roomType || room.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
      </div>
  );
};

export default RoomCard;