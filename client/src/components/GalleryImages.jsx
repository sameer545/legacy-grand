import React, { useEffect, useState } from "react";
import * as apiClient from "../api-client";

export default function GalleryImages({ roomType }) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await apiClient.getGalleryImages(roomType);
        setImages(data);
      } catch {
        setImages([]);
      }
    };
    fetchImages();
  }, [roomType]);

  if (!images.length) {
    return <p className="text-gray-500">No images yet</p>;
  }

  return (
    <>
      {/* Thumbnails */}
      {images.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt={roomType}
          className="rounded-lg shadow-lg object-cover h-48 w-full cursor-pointer hover:opacity-80 transition"
          onClick={() => setSelectedImage(url)}
        />
      ))}

      {/* Modal for full-size image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)} // close on overlay click
        >
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
          >
            <img
              src={selectedImage}
              alt="Full Size"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
            />
            <button
              className="absolute top-2 right-2 text-white text-3xl font-bold"
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
