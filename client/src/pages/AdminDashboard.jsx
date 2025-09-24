import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppContext } from '../contexts/AppContext';
import { Navigate } from 'react-router-dom';
import { FaLock, FaUnlock, FaSync, FaEye } from 'react-icons/fa';

const AdminDashboard = () => {
  const { role, isLoggedIn, showToast } = useAppContext();
  const [stats, setStats] = useState({
    totalRooms: 8,
    totalBookings: 0,
    totalMessages: 0,
    availableRooms: 0,
    lockedRooms: 0,
    occupiedRooms: 0
  });
  
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [adminRooms, setAdminRooms] = useState({});
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncing, setSyncing] = useState(false);

  // Helper function to check if a room is available (replaces the missing method)
  const isRoomAvailable = (room) => {
    return !room.isLocked && !room.isOccupied;
  };

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (isLoggedIn && role === 'admin') {
      fetchAdminData();
    }
  }, [isLoggedIn, role]);

  // Move the redirect check AFTER all hooks
  if (!isLoggedIn || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      
      // Fetch all admin data including admin rooms
      const [adminRoomsRes, bookingsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin-rooms`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/bookings/admin`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/contact/admin`, { withCredentials: true })
      ]);

      const adminRoomsData = adminRoomsRes.data;
      const bookingsData = bookingsRes.data;
      const messagesData = messagesRes.data;

      setAdminRooms(adminRoomsData.rooms || {});
      setAllRooms(adminRoomsData.allRooms || []);
      setBookings(bookingsData);
      setMessages(messagesData);
      
      setStats({
        totalRooms: adminRoomsData.stats?.totalRooms || 8,
        totalBookings: bookingsData.length,
        totalMessages: messagesData.length,
        availableRooms: adminRoomsData.stats?.availableRooms || 0,
        lockedRooms: adminRoomsData.stats?.lockedRooms || 0,
        occupiedRooms: adminRoomsData.stats?.occupiedRooms || 0
      });

      showToast({ 
        message: 'Dashboard data loaded successfully!', 
        type: 'SUCCESS' 
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast({ 
        message: 'Error loading dashboard data', 
        type: 'ERROR' 
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRoomLock = async (roomId, currentLockStatus) => {
    try {
      const lockReason = !currentLockStatus 
        ? prompt('Enter reason for locking this room (optional):')
        : null;

      // If user cancels the prompt when trying to lock, don't proceed
      if (!currentLockStatus && lockReason === null) {
        return;
      }

      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      const response = await axios.post(
        `${API_BASE}/api/admin-rooms/toggle-lock/${roomId}`,
        { lockReason },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Refresh the admin rooms data
        await fetchAdminData();
        showToast({ 
          message: response.data.message, 
          type: 'SUCCESS' 
        });
      }
    } catch (error) {
      console.error('Error toggling room lock:', error);
      showToast({ 
        message: error.response?.data?.error || 'Error updating room lock status', 
        type: 'ERROR' 
      });
    }
  };

  const syncWithBookings = async () => {
    try {
      setSyncing(true);
      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      
      const response = await axios.post(
        `${API_BASE}/api/admin-rooms/sync-with-bookings`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        await fetchAdminData(); // Refresh data after sync
        showToast({ 
          message: response.data.message, 
          type: 'SUCCESS' 
        });
      }
    } catch (error) {
      console.error('Error syncing with bookings:', error);
      showToast({ 
        message: error.response?.data?.error || 'Error syncing with bookings', 
        type: 'ERROR' 
      });
    } finally {
      setSyncing(false);
    }
  };

  const getAssignedRoom = (bookingId) => {
    return allRooms.find(room => room.currentBookingId === bookingId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#bfa442] text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color = "text-white" }) => (
    <div className="bg-gradient-to-br from-black to-gray-900 border border-[#bfa442]/30 rounded-xl p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-[#bfa442] text-lg font-semibold">{title}</h3>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );

  const RoomCard = ({ room }) => {
    // Use our helper function instead of room.isAvailable()
    const isAvailable = isRoomAvailable(room);
    
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-[#bfa442]/20 rounded-lg p-4 hover:border-[#bfa442]/40 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-[#bfa442] font-semibold text-lg">Room {room.roomNumber}</h3>
            <p className="text-gray-300 text-sm">{room.roomType}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {room.isLocked ? (
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white flex items-center gap-1">
                <FaLock className="text-xs" />
                Locked
              </div>
            ) : room.isOccupied ? (
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-600 text-black">
                Occupied
              </div>
            ) : (
              <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white flex items-center gap-1">
                <FaUnlock className="text-xs" />
                Available
              </div>
            )}
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{room.description}</p>
        
        {room.isLocked ? (
          <div className="bg-red-900/30 border border-red-500/30 rounded p-2 mb-3">
            <p className="text-red-300 text-xs font-semibold flex items-center gap-1">
              <FaLock /> Room Locked by Admin
            </p>
            {room.lockReason && (
              <p className="text-red-200 text-xs mt-1">Reason: {room.lockReason}</p>
            )}
            {room.lockedAt && (
              <p className="text-red-200 text-xs mt-1">
                Locked: {new Date(room.lockedAt).toLocaleString()}
              </p>
            )}
          </div>
        ) : room.isOccupied ? (
          <div className="bg-gray-800 rounded p-2 mb-3">
            <p className="text-[#bfa442] text-xs font-semibold">Guest Details:</p>
            <p className="text-white text-sm">{room.currentGuest}</p>
            {room.checkInDate && (
              <p className="text-gray-400 text-xs">
                Check-in: {new Date(room.checkInDate).toLocaleDateString()}
              </p>
            )}
            {room.checkOutDate && (
              <p className="text-gray-400 text-xs">
                Check-out: {new Date(room.checkOutDate).toLocaleDateString()}
              </p>
            )}
            {room.currentBookingId && (
              <p className="text-gray-500 text-xs">
                Booking: #{room.currentBookingId.toString().slice(-8).toUpperCase()}
              </p>
            )}
          </div>
        ) : null}
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#bfa442] font-semibold">₹{room.price.toLocaleString()}/night</span>
          <span className="text-gray-500 text-xs">
            Updated: {new Date(room.updatedAt).toLocaleTimeString()}
          </span>
        </div>
        
        <button
          onClick={() => toggleRoomLock(room._id, room.isLocked)}
          disabled={room.isOccupied && !room.isLocked}
          className={`w-full py-2 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
            room.isLocked
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : room.isOccupied
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {room.isLocked ? (
            <>
              <FaUnlock /> Unlock Room
            </>
          ) : room.isOccupied ? (
            'Room Occupied'
          ) : (
            <>
              <FaLock /> Lock Room
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#bfa442]">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <button
              onClick={syncWithBookings}
              disabled={syncing}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <FaSync className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync Bookings'}
            </button>
            <button
              onClick={fetchAdminData}
              className="bg-[#bfa442] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#e5c97b] transition"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard 
            title="Available Rooms" 
            value={`${stats.availableRooms}/${stats.totalRooms}`} 
            icon="🏨" 
            color="text-green-400"
          />
          <StatCard 
            title="Occupied Rooms" 
            value={stats.occupiedRooms} 
            icon="👥" 
            color="text-yellow-400"
          />
          <StatCard 
            title="Locked Rooms" 
            value={stats.lockedRooms} 
            icon="🔒" 
            color="text-red-400"
          />
          <StatCard title="Total Bookings" value={stats.totalBookings} icon="📅" />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 sm:space-x-4 mb-6 overflow-x-auto">
          {['overview', 'rooms', 'bookings', 'messages'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-[#bfa442] text-black'
                  : 'bg-gray-800 text-[#bfa442] hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#bfa442] mb-4">Overview</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Real-time Status</h3>
                <div className="space-y-2 text-gray-300 text-sm sm:text-base">
                  <p>• {stats.availableRooms} rooms available for walk-ins</p>
                  <p>• {stats.occupiedRooms} rooms currently occupied</p>
                  <p>• {stats.lockedRooms} rooms locked by admin</p>
                  <p>• {stats.totalBookings} total online bookings</p>
                  <p>• Room availability synced with database</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab('rooms')}
                    className="block w-full text-left px-4 py-2 bg-[#bfa442] text-black rounded hover:bg-[#e5c97b] transition text-sm sm:text-base"
                  >
                    Manage Room Lock/Unlock
                  </button>
                  <button 
                    onClick={() => setActiveTab('bookings')}
                    className="block w-full text-left px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm sm:text-base"
                  >
                    View All Bookings
                  </button>
                  <button 
                    onClick={syncWithBookings}
                    disabled={syncing}
                    className="block w-full text-left px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-50"
                  >
                    {syncing ? 'Syncing...' : 'Sync with Latest Bookings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#bfa442]">Room Lock/Unlock Management</h2>
              <div className="text-sm text-gray-400">
                Available: {stats.availableRooms} | Occupied: {stats.occupiedRooms} | Locked: {stats.lockedRooms}
              </div>
            </div>
            
            {Object.entries(adminRooms).map(([roomType, roomsOfType]) => (
              <div key={roomType} className="mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-[#bfa442] mb-4 border-b border-[#bfa442]/30 pb-2">
                  {roomType}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {roomsOfType.map((room) => (
                    <RoomCard key={room._id} room={room} />
                  ))}
                </div>
              </div>
            ))}
            
            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <h4 className="text-[#bfa442] font-semibold mb-2">Room Lock Features:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>🔒 <strong>Lock Room</strong> - Prevent users from booking specific rooms</li>
                <li>🔓 <strong>Unlock Room</strong> - Make locked rooms available for booking</li>
                <li>📝 <strong>Lock Reason</strong> - Add optional reason for locking (maintenance, etc.)</li>
                <li>🚫 <strong>Booking Prevention</strong> - Locked rooms won't appear as available to users</li>
                <li>✅ <strong>Database Sync</strong> - All lock states are persisted in the database</li>
                <li>🔄 <strong>Auto-Sync</strong> - System respects both bookings and admin locks</li>
                <li>💡 <strong>Tip:</strong> Use locks for maintenance, cleaning, or temporary unavailability</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#bfa442] mb-4">All Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-400">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-base">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">User</th>
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">Room Type</th>
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">Check-in</th>
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">Check-out</th>
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">Status</th>
                      <th className="pb-2 text-[#bfa442] text-xs sm:text-sm">Assigned Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => {
                      const assignedRoom = getAssignedRoom(booking._id);
                      return (
                        <tr key={booking._id} className="border-b border-gray-800">
                          <td className="py-2 sm:py-3 text-xs sm:text-sm">{booking.userId?.name || 'N/A'}</td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm">{booking.roomId?.name || 'N/A'}</td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm">
                            {new Date(booking.checkIn).toLocaleDateString()}
                          </td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm">
                            {new Date(booking.checkOut).toLocaleDateString()}
                          </td>
                          <td className="py-2 sm:py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              booking.paymentStatus === 'Paid'
                                ? 'bg-green-600 text-white'
                                : 'bg-yellow-600 text-black'
                            }`}>
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 text-xs sm:text-sm">
                            {assignedRoom ? (
                              <span className="text-[#bfa442]">Room {assignedRoom.roomNumber}</span>
                            ) : (
                              <span className="text-gray-500">Not assigned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-gray-900 rounded-xl p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#bfa442] mb-4">Contact Messages</h2>
            {messages.length === 0 ? (
              <p className="text-gray-400">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message._id} className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                      <h3 className="text-[#bfa442] font-semibold text-sm sm:text-base">{message.name}</h3>
                      <span className="text-gray-400 text-xs sm:text-sm">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm mb-2">{message.email}</p>
                    <p className="text-white text-sm sm:text-base">{message.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;