import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const BookRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(null);


  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/rooms/${id}`);
        setRoom(res.data);
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBooking = () => {
    if (!checkOut) return alert("Please select a check-out date.");

    // For now just log and navigate to a dummy success page
    console.log({
      roomId: room._id,
      checkIn,
      checkOut,
    });

    navigate("/payment", { state: { room, checkIn, checkOut } });
  };

  if (!room) return <div className="text-gold p-6">Loading room...</div>;

  return (
    <div className="bg-black text-gold min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto border border-gold p-6 rounded">
        <h1 className="text-2xl font-bold mb-4">Book: {room.name}</h1>
        <img src={room.image} alt={room.name} className="w-full h-60 object-cover rounded mb-4" />
        <p className="mb-4">{room.description}</p>
        <p className="mb-6 font-semibold text-lg">Price: ₹{room.price} / night</p>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div>
            <label className="block mb-1">Check-in Date</label>
            <DatePicker
              selected={checkIn}
              onChange={(date) => setCheckIn(date)}
              className="text-black px-3 py-2 rounded"
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
            />
          </div>

          <div>
            <label className="block mb-1">Check-out Date</label>
            <DatePicker
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              className="text-black px-3 py-2 rounded"
              dateFormat="dd/MM/yyyy"
              minDate={checkIn}
            />
          </div>
        </div>

        <button
          onClick={handleBooking}
          className="bg-gold text-black px-6 py-2 rounded hover:bg-yellow-400"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default BookRoom;
