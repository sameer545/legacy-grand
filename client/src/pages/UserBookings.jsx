import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppContext } from '../contexts/AppContext';
import { Navigate } from 'react-router-dom';

const UserBookings = () => {
  const { isLoggedIn, showToast } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = useCallback(async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.get(`${API_BASE}/api/bookings/user`, {
        withCredentials: true
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showToast({ message: 'Error fetching bookings', type: 'ERROR' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Only fetch bookings if user is logged in
    if (isLoggedIn) {
      fetchUserBookings();
    }
  }, [isLoggedIn, fetchUserBookings]);

  // Move the redirect check AFTER all hooks
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#bfa442] text-xl">Loading your bookings...</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-600 text-white';
      case 'Pending':
        return 'bg-yellow-600 text-black';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const calculateNights = (checkIn, checkOut) => {
    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isUpcoming = (checkIn) => {
    return new Date(checkIn) > new Date();
  };

  const isPast = (checkOut) => {
    return new Date(checkOut) < new Date();
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#bfa442] mb-8 text-center">
          My Bookings
        </h1>

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-2xl text-[#bfa442] mb-4">No Bookings Yet</h2>
            <p className="text-gray-400 mb-6">
              You haven't made any bookings yet. Explore our rooms and make your first reservation!
            </p>
            <a
              href="/rooms"
              className="bg-[#bfa442] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#e5c97b] transition"
            >
              Browse Rooms
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-900 border border-[#bfa442]/30 rounded-xl p-6 hover:border-[#bfa442]/60 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#bfa442] mb-2">
                      {booking.roomId?.name || 'Room'}
                    </h2>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                      {isUpcoming(booking.checkIn) && (
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                          Upcoming
                        </span>
                      )}
                      {isPast(booking.checkOut) && (
                        <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Booking ID</div>
                    <div className="font-mono text-[#bfa442]">
                      #{booking._id.slice(-8).toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div>
                    <h3 className="text-[#bfa442] font-semibold mb-2">Check-in</h3>
                    <div className="text-white">
                      <div>{new Date(booking.checkIn).toLocaleDateString('en-GB')}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#bfa442] font-semibold mb-2">Check-out</h3>
                    <div className="text-white">
                      <div>{new Date(booking.checkOut).toLocaleDateString('en-GB')}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[#bfa442] font-semibold mb-2">Duration</h3>
                    <div className="text-white">
                      <div>{calculateNights(booking.checkIn, booking.checkOut)} nights</div>
                      <div className="text-sm text-gray-400">
                        ₹{booking.roomId?.price ? (booking.roomId.price * calculateNights(booking.checkIn, booking.checkOut)).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.roomId?.description && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-300 text-sm">{booking.roomId.description}</p>
                  </div>
                )}

                {booking.paymentId && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-sm text-gray-400">
                      Payment ID: <span className="font-mono text-[#bfa442]">{booking.paymentId}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <a
            href="/rooms"
            className="bg-transparent border-2 border-[#bfa442] text-[#bfa442] px-6 py-3 rounded-lg font-semibold hover:bg-[#bfa442] hover:text-black transition"
          >
            Book Another Room
          </a>
        </div>
      </div>
    </div>
  );
};

export default UserBookings;