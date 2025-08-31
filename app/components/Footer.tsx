"use client";

import React from "react";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const services = {
    left: ["Marketing", "Social", "Design"],
    right: ["AR/VR", "POS", "Campaign"],
  };

  const cases = [
    "EA Games",
    "SAMSUNG",
    "MICROSOFT",
    "META",
    "MARSHALL",
    "BLIZZARD",
  ];

  const aboutUs = ["Our Story", "We are Special", "Work with us"];

  const legal = ["Disclaimer", "Data Protection", "Terms of Use"];

  return (
    <footer className={`bg-neutral-900 text-neutral-200 py-8 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Top border line */}
        <div className="w-full h-px bg-neutral-600 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[163px]">
          {/* Company Name */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <h1 className="text-7xl font-medium tracking-tighter text-neutral-300">
              1SP
            </h1>
            <h2 className="text-xl font-bold tracking-tight text-neutral-300">
              Superagency
            </h2>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-eyebrow text-neutral-300 mb-4">Services</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {services.left.map((service, index) => (
                  <p
                    key={index}
                    className="text-body-md text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                    {service}
                  </p>
                ))}
              </div>
              <div className="space-y-2">
                {services.right.map((service, index) => (
                  <p
                    key={index}
                    className="text-body-md text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                    {service}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Cases */}
          <div className="lg:col-span-2">
            <h3 className="text-eyebrow text-neutral-300 mb-4">Cases</h3>
            <div className="space-y-2">
              {cases.map((caseItem, index) => (
                <p
                  key={index}
                  className="text-body-md text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                  {caseItem}
                </p>
              ))}
            </div>
          </div>

          {/* About Us */}
          <div className="lg:col-span-2">
            <h3 className="text-eyebrow text-neutral-300 mb-4">About us</h3>
            <div className="space-y-2">
              {aboutUs.map((item, index) => (
                <p
                  key={index}
                  className="text-body-md text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h3 className="text-eyebrow text-neutral-300 mb-4">Legal</h3>
            <div className="space-y-2">
              {legal.map((item, index) => (
                <p
                  key={index}
                  className="text-body-md text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
        {/* Separator line
        <div className="w-full h-px bg-neutral-400 mt-8"></div> */}
      </div>
    </footer>
  );
};

export default Footer;
