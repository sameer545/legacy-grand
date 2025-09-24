import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-gray-200 px-6 py-20">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
            About Legacy Grand
          </span>
        </h1>

        {/* Content */}
        <div className="space-y-8 text-lg leading-relaxed">
          <p>
            Welcome to <span className="text-gold font-semibold">Legacy Grand</span>, 
            located in Gachibowli, Hyderabad. We offer comfortable, air‑conditioned 
            rooms that can be upgraded into spacious suites with private balconies. 
            Just minutes from <span className="text-gold">AIG Hospital</span>, 
            <span className="text-gold"> Deloitte</span>, and 
            <span className="text-gold"> Hi‑Tech City</span>, we are the ideal 
            destination for business travelers, medical visitors, and short getaways.
          </p>

          <p>
            Guests also enjoy access to our serene <span className="text-gold">open terrace</span> — 
            a peaceful retreat to unwind after a busy day.
          </p>

          {/* Highlight Box */}
          <div className="bg-neutral-950/60 border border-yellow-600/30 rounded-lg p-8 shadow-xl">
            <p className="text-xl md:text-2xl font-light text-center">
              “At Legacy Grand, we don’t just provide a stay — 
              <span className="text-gold font-semibold"> we deliver a legacy of unforgettable moments.</span>”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;