import React, { useState, useEffect } from "react";
import axios from "axios";
import { getGalleryImages } from "../api-client";
import RoomCard from "../components/RoomCard";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function Rooms() {
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

  if (loading) {
    return (
      <div className="text-center text-lg mt-10 text-yellow-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 bg-black min-h-screen">
      <h1 className="text-4xl font-bold mb-10 text-center text-yellow-500 uppercase tracking-widest">
        Our Rooms
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {rooms.map((room) => (
          <RoomCard key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
}
