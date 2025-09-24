import React, { useState } from "react";
import { FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import axios from "axios";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const API_BASE = process.env.REACT_APP_API_BASE_URL;
      await axios.post(`${API_BASE}/api/contact`, formData);
      
      setSubmitMessage("Thank you for contacting us! We'll get back to you soon.");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitMessage("Sorry, there was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-4 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl p-10">
          <h1 className="text-4xl font-extrabold text-center mb-8 text-[#bfa442]">Contact Us</h1>

          {submitMessage && (
            <div className={`p-4 rounded-lg mb-6 text-center ${
              submitMessage.includes('error') || submitMessage.includes('Sorry') 
                ? 'bg-red-500/20 border border-red-500/40 text-red-200'
                : 'bg-green-500/20 border border-green-500/40 text-green-200'
            }`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#bfa442] disabled:opacity-50"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#bfa442] disabled:opacity-50"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[#bfa442] disabled:opacity-50"
                placeholder="Your message"
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#bfa442] text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>

          {/* Social Icons */}
          <div className="mt-10 text-center">
            <p className="text-sm mb-3">Or reach out through:</p>
            <div className="flex justify-center gap-6 text-2xl text-[#bfa442]">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <FaLinkedin className="hover:text-white transition duration-300" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="hover:text-white transition duration-300" />
              </a>
              <a href="mailto:contact@legacygrand.com">
                <FaEnvelope className="hover:text-white transition duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Embedded Map */}
        <div className="rounded-3xl overflow-hidden shadow-xl border border-white/10">
          <iframe
            title="Legacy Grand Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3696344566174!2d78.3675008!3d17.442013700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb93109e367c83%3A0xe578f3eb65872442!2sHotel%20Legacy%20Grand!5e0!3m2!1sen!2sin!4v1754607017283!5m2!1sen!2sin" 
            width="100%"
            height="100%"
            style={{ minHeight: "550px", border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;