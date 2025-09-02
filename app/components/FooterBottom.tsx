"use client";

import React, { useState } from "react";

const FooterBottom = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log("Newsletter signup:", email);
  };

  return (
    <div className="bg-neutral-900 text-gray-400 border-t pb-8 border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-24">
          {/* Social Media Icons */}
          <div className="flex gap-4 items-center">
            <a
              href="#"
              className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
              aria-label="Meta">
              <img src="/MetaLogo.svg" alt="Meta" className="w-full h-full" />
            </a>
            <a
              href="#"
              className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
              aria-label="Instagram">
              <img
                alt="Instagram"
                src="/InstagramLogo.svg"
                className="w-full h-full"
              />
            </a>
            <a
              href="#"
              className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
              aria-label="TikTok">
              <img
                src="TiktokLogo.svg"
                alt="TikTok"
                className="w-full h-full"
              />
            </a>
            <a
              href="#"
              className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
              aria-label="LinkedIn">
              <img
                src="/LinkedinLogo.svg"
                alt="LinkedIn"
                className="w-full h-full"
              />
            </a>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1">
            {/* Company Info */}
            <div className="flex-1">
              <h3 className="text-gray-400 text-[15px] font-medium mb-4">
                Super* international
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-3">
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Mallorca
                  </p>
                </div>
                <div className="border-b border-gray-700 pb-3">
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Address
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex-1">
              <h3 className="text-gray-400 text-[15px] font-medium mb-4">
                Stay in touch
              </h3>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="border border-gray-700 rounded-none">
                  <div className="flex">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <span className="text-gray-400 text-[11px] px-3 py-3 border-r border-gray-700">
                      Newsletter:
                    </span>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your e-mail address"
                      className="flex-1 bg-transparent text-gray-500 text-[11px] px-3 py-3 outline-none placeholder-gray-600 focus:placeholder-gray-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-transparent border border-gray-700 text-gray-400 text-[11px] py-3 px-3 hover:border-lime-400 hover:text-lime-400 transition-colors duration-200 focus:outline-none focus:border-lime-400 focus:text-lime-400">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterBottom;
