import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaWifi,
  FaTv,
  FaSnowflake,
  FaUtensils,
  FaShower,
} from "react-icons/fa";
import { useAppContext } from "../contexts/AppContext";
import { getGalleryImages } from "../api-client";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const { isLoggedIn, showToast } = useAppContext();

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        // Step 1: Get room details
        const res = await axios.get(`${API_BASE}/api/rooms/${id}`);
        const roomData = res.data;

        // Step 2: Get gallery images (fallback to empty array)
        let images = [];
        try {
          images = await getGalleryImages(roomData.name);
        } catch {
          images = [];
        }

        // Step 3: Merge into one state
        setRoom({ ...roomData, images });
      } catch (err) {
        console.error("Error fetching room:", err);
        showToast({ message: "Error loading room details", type: "ERROR" });
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, showToast]);

  // Calculate nights and total price
  useEffect(() => {
    if (checkIn && checkOut && room) {
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffNights > 0) {
        setNights(diffNights);
        setTotalPrice(diffNights * room.price);
      } else {
        setNights(0);
        setTotalPrice(0);
        if (checkOut <= checkIn) {
          setAvailabilityMessage("Check-out date must be after check-in date");
        }
      }
    } else {
      setNights(0);
      setTotalPrice(0);
      setAvailabilityMessage("");
    }
  }, [checkIn, checkOut, room]);

  // Check availability when dates change (simplified - only admin locks)
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut || !room || checkOut <= checkIn) {
        setAvailabilityMessage("");
        return;
      }

      setAvailabilityChecking(true);
      try {
        const response = await axios.post(`${API_BASE}/api/rooms/check-availability`, {
          roomId: room._id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        });

        if (response.data.available) {
          setAvailabilityMessage(`✅ Available (${response.data.availableRooms} room${response.data.availableRooms !== 1 ? 's' : ''} available)`);
        } else {
          if (response.data.reason === "admin_locked") {
            setAvailabilityMessage("❌ This room type is currently unavailable");
          } else {
            setAvailabilityMessage(`❌ ${response.data.error || 'Not available'}`);
          }
        }
      } catch (error) {
        console.error("Error checking availability:", error);
        const errorMessage = error.response?.data?.error || "Error checking availability";
        if (error.response?.data?.reason === "admin_locked") {
          setAvailabilityMessage("❌ This room type is currently unavailable");
        } else {
          setAvailabilityMessage(`❌ ${errorMessage}`);
        }
      } finally {
        setAvailabilityChecking(false);
      }
    };

    // Debounce the availability check
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [checkIn, checkOut, room]);

  const validateBookingData = () => {
    if (!isLoggedIn) {
      showToast({ message: "Please log in to book", type: "ERROR" });
      navigate("/login");
      return false;
    }

    if (!checkIn || !checkOut) {
      showToast({ message: "Please select both check-in and check-out dates", type: "ERROR" });
      return false;
    }

    if (checkOut <= checkIn) {
      showToast({ message: "Check-out date must be after check-in date", type: "ERROR" });
      return false;
    }

    if (nights <= 0 || totalPrice <= 0) {
      showToast({ message: "Please select valid dates", type: "ERROR" });
      return false;
    }

    if (totalPrice < 100) { // Minimum booking amount
      showToast({ message: "Minimum booking amount is ₹100", type: "ERROR" });
      return false;
    }

    return true;
  };

  const loadRazorpay = async () => {
    if (!validateBookingData()) {
      return;
    }

    setPaymentLoading(true);

    try {
      console.log("Creating order with data:", {
        amount: totalPrice,
        currency: "INR",
        roomId: room._id,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        roomName: room.name
      });

      // Step 1: Create order and booking
      const { data } = await axios.post(
        `${API_BASE}/api/payment/create-order`,
        {
          amount: totalPrice,
          currency: "INR",
          roomId: room._id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Order creation response:", data);

      if (!data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // Step 2: Get Razorpay key
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key not configured. Please contact support.");
      }

      // Step 3: Setup Razorpay options
      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Legacy Grand Hotel",
        description: `Booking for: ${room.name} (${nights} night${nights > 1 ? "s" : ""})`,
        order_id: data.order.id,
        handler: async function (response) {
          try {
            console.log("Payment successful, verifying...", response);
            
            // Verify payment
            const verify = await axios.post(
              `${API_BASE}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: data.bookingId,
              },
              { withCredentials: true }
            );

            console.log("Payment verification response:", verify.data);

            if (verify.data.success) {
              showToast({ message: "Payment successful! Booking confirmed.", type: "SUCCESS" });
              
              // Redirect to bookings page after a short delay
              setTimeout(() => {
                navigate("/my-bookings");
              }, 2000);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            const errorMessage = err.response?.data?.message || err.message || "Payment verification failed";
            showToast({ message: errorMessage, type: "ERROR" });
          }
        },
        prefill: {
          name: "Guest User",
          email: "guest@example.com",
        },
        theme: {
          color: "#bfa442",
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            showToast({ message: "Payment cancelled", type: "ERROR" });
          }
        }
      };

      // Step 4: Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded. Please refresh the page and try again.");
      }

      // Step 5: Open Razorpay
      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error("Payment error:", error);
      
      let errorMessage = "Payment failed. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        console.error("Server error response:", serverError);
        
        if (serverError.error) {
          errorMessage = serverError.error;
        } else if (serverError.message) {
          errorMessage = serverError.message;
        }
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (serverError.reason === "admin_locked") {
            errorMessage = "This room type is currently unavailable";
          } else if (serverError.reason === "invalid_dates") {
            errorMessage = "Please check your selected dates";
          }
        } else if (error.response.status === 401) {
          errorMessage = "Please log in to continue";
          setTimeout(() => navigate("/login"), 2000);
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your connection.";
      }
      
      showToast({ 
        message: errorMessage, 
        type: "ERROR" 
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#bfa442] text-xl">Loading room details...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl">Room not found</div>
      </div>
    );
  }

  const isBookingDisabled = !checkIn || !checkOut || paymentLoading || totalPrice <= 0 || 
                           availabilityMessage.includes("❌") || checkOut <= checkIn;

  return (
    <div className="min-h-screen bg-black text-[#bfa442] p-6">
      <div className="max-w-5xl mx-auto rounded-xl border border-[#bfa44250] shadow-lg overflow-hidden backdrop-blur-lg bg-black/60">
        
        {/* Main Image */}
        {room.images && room.images.length > 0 ? (
          <img
            src={room.images[0]}
            alt={room.name}
            className="w-full h-80 object-cover rounded-t-xl"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-80 text-gray-500 italic">
            No image available
          </div>
        )}

        <div className="p-6 space-y-5">
          <h2 className="text-3xl font-bold drop-shadow">
            {room.roomType || room.name}
          </h2>
          <p className="text-[#e5c97b] text-lg">{room.description}</p>

          {/* Amenities */}
          <div className="flex gap-6 text-xl text-[#e5c97b]">
            <FaWifi title="Free WiFi" className="hover:text-white transition" />
            <FaTv title="Smart TV" className="hover:text-white transition" />
            <FaSnowflake title="Air Conditioning" className="hover:text-white transition" />
            <FaUtensils title="Room Service" className="hover:text-white transition" />
            <FaShower title="Private Bath" className="hover:text-white transition" />
          </div>

          {/* Date Picker */}
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block mb-1">Check-In</label>
              <DatePicker
                selected={checkIn}
                onChange={(date) => {
                  setCheckIn(date);
                  if (date) {
                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    if (!checkOut || checkOut <= date) {
                      setCheckOut(nextDay);
                    }
                  }
                }}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                dateFormat="dd/MM/yyyy"
                className="p-2 rounded-md bg-black border border-[#bfa44250] text-white"
                placeholderText="Select check-in date"
              />
            </div>
            <div>
              <label className="block mb-1">Check-Out</label>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
                dateFormat="dd/MM/yyyy"
                className="p-2 rounded-md bg-black border border-[#bfa44250] text-white"
                placeholderText="Select check-out date"
              />
            </div>
          </div>

          {/* Availability Status */}
          {(availabilityChecking || availabilityMessage) && (
            <div className="p-3 rounded-md border border-[#bfa44250] bg-black/40">
              {availabilityChecking ? (
                <span className="text-yellow-400">🔍 Checking availability...</span>
              ) : (
                <span className={availabilityMessage.includes("✅") ? "text-green-400" : "text-red-400"}>
                  {availabilityMessage}
                </span>
              )}
            </div>
          )}

          {/* Price Info */}
          <div>
            <p className="text-lg">
              Price per night: ₹ {room.price.toLocaleString()}
            </p>
            {totalPrice > 0 && (
              <p className="text-xl font-semibold text-[#FFD700]">
                Total for {nights} night{nights > 1 ? "s" : ""}: ₹{" "}
                {totalPrice.toLocaleString()}
              </p>
            )}
          </div>

          {/* Pay & Book Button */}
          <button
            onClick={loadRazorpay}
            disabled={isBookingDisabled}
            className={`w-full text-center font-semibold py-3 rounded-md transition-all duration-300 ${
              isBookingDisabled
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-[#bfa442] to-[#e5c97b] text-black hover:from-[#e5c97b] hover:to-[#bfa442]"
            }`}
          >
            {paymentLoading ? "Processing..." : "Pay & Book Now"}
          </button>

          {!isLoggedIn && (
            <p className="text-center text-yellow-400 text-sm">
              Please <button 
                onClick={() => navigate("/login")} 
                className="underline hover:text-white"
              >
                log in
              </button> to book a room
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;