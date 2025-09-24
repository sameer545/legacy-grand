import React, { useState, useEffect } from "react";
import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";

const roomTypes = [
  { key: "standard-family-room", label: "Standard Family Room" },
  { key: "luxury-studio-room", label: "Luxury Studio Room" },
  { key: "balcony-view-room", label: "Balcony View Room" },
  { key: "legacy-suite", label: "Legacy Suite" },
  { key: "surroundings", label: "Surroundings" },
];

function RoomGallery({ roomType }) {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    let mounted = true;
    async function fetchImages() {
      try {
        const data = await apiClient.getGalleryImages(roomType);
        const imgs = Array.isArray(data) ? data : data?.images ?? [];
        if (mounted) setImages(imgs);
      } catch (err) {
        console.error("Failed to fetch gallery images", err);
        if (mounted) setImages([]);
      }
    }
    fetchImages();
    return () => {
      mounted = false;
    };
  }, [roomType]);

  // keyboard support
  useEffect(() => {
    if (selectedIndex === -1) return;
    const onKey = (e) => {
      if (e.key === "Escape") setSelectedIndex(-1);
      if (e.key === "ArrowLeft")
        setSelectedIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
      if (e.key === "ArrowRight")
        setSelectedIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="text-6xl mb-4">📸</div>
        <p className="text-gray-400">No images available yet</p>
      </div>
    );
  }

  const openAt = (index) => setSelectedIndex(index);
  const close = () => setSelectedIndex(-1);
  const prev = (e) => {
    e && e.stopPropagation();
    setSelectedIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  };
  const next = (e) => {
    e && e.stopPropagation();
    setSelectedIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  };

  return (
    <>
      {images.map((url, idx) => (
        <div
          key={`${idx}-${url}`}
          className="group cursor-pointer relative overflow-hidden rounded-xl border border-[#bfa442]/30 hover:border-[#bfa442]/60 transition-all duration-300"
          onClick={() => openAt(idx)}
        >
          <img
            src={url}
            alt={`${roomType}-${idx}`}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-12 h-12 text-[#bfa442]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        </div>
      ))}

      {selectedIndex > -1 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              className="absolute -top-12 right-0 text-[#bfa442] hover:text-white text-2xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Close (Esc)"
            >
              ✕
            </button>
            <img
              src={images[selectedIndex]}
              alt={`full-${selectedIndex}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl border border-[#bfa442]/30"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bfa442] hover:text-white text-4xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                  title="Previous (←)"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bfa442] hover:text-white text-4xl bg-black/50 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                  title="Next (→)"
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#bfa442] text-sm bg-black/50 px-3 py-1 rounded-full">
                  {selectedIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default function GalleryPage() {
  const { role } = useAppContext();
  const [selectedRoom, setSelectedRoom] = useState(roomTypes[0].key);
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select an image first");

    const formData = new FormData();
    formData.append("image", file);
    const roomLabel = roomTypes.find((r) => r.key === selectedRoom).label;
    formData.append("roomType", roomLabel);

    try {
      await apiClient.uploadGalleryImage(formData);
      alert("Image uploaded successfully");
      window.location.reload();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-[#bfa442]">
          Gallery
        </h1>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
          Explore our beautiful spaces and discover the luxury that awaits you
        </p>

        {role === "admin" && (
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#bfa442]/30 rounded-xl p-6 mb-12">
            <h2 className="text-2xl font-bold text-[#bfa442] mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Photos
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#bfa442] mb-2">
                  Select Room Type
                </label>
                <select
                  className="w-full bg-gray-800 border border-[#bfa442]/30 rounded-lg px-4 py-3 text-white focus:border-[#bfa442] focus:ring-2 focus:ring-[#bfa442]/20 focus:outline-none transition-all"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                >
                  {roomTypes.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#bfa442] mb-2">
                  Choose Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full bg-gray-800 border border-[#bfa442]/30 rounded-lg px-4 py-3 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-[#bfa442] file:text-black hover:file:bg-[#e5c97b] file:cursor-pointer transition-all"
                />
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!file}
                className="px-6 py-3 bg-[#bfa442] text-black font-semibold rounded-lg hover:bg-[#e5c97b] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
              >
                Upload Image
              </button>
            </div>
          </div>
        )}

        {/* Gallery Sections */}
        <div className="space-y-16">
          {roomTypes.map((room, index) => (
            <section key={room.key} className="group">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#bfa442] to-[#e5c97b] text-black rounded-full font-bold text-lg">
                  {index + 1}
                </div>
                <h2 className="text-3xl font-bold text-[#bfa442] group-hover:text-[#e5c97b] transition-colors">
                  {room.label}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#bfa442]/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <RoomGallery roomType={room.key} />
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-[#bfa442]/30">
          <p className="text-gray-400">
            Experience luxury and comfort in every corner of our establishment
          </p>
        </div>
      </div>
    </div>
  );
}