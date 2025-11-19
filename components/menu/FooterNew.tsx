"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FooterMenu } from "@/types/menu.types";
import Image from "next/image";

interface FooterProps {
  className?: string;
  menuData?: FooterMenu | null;
}

const Footer: React.FC<FooterProps> = ({ className = "", menuData }) => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup - integrate with your newsletter service
  };


  return (
    <>
      {/* Main Footer */}
      <footer className={`bg-neutral-900 text-neutral-200 py-8 ${className}`}>
        <div className="container mx-auto px-4">
          {/* Top border line */}
          <div className="w-full h-px bg-neutral-600 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[163px]">
            {/* Company Name */}
            <div className="lg:col-span-3 flex flex-col justify-center gap-3">
              <Image src={menuData?.imageCloud?.secure_url || "/1sp-fallback.svg"} alt="Logo" width={146} height={79} />
              
            </div>

            {/* Dynamic Footer Columns from Sanity */}
            {menuData?.footerColumns && menuData.footerColumns.length > 0 ? (
              menuData.footerColumns.map((column) => (
                <div key={column._key} className="lg:col-span-2">
                  <h3 className="text-sm text-neutral-300 mb-4">
                    {column.title}
                  </h3>
                  <div className="space-y-2">
                    {column.links?.map((link) => (
                      <Link
                        key={link._key}
                        href={
                          link.linkType === "external"
                            ? link.externalUrl || "#"
                            : link.isCaseLink
                            ? `/cases/${link.case?.slug?.current || ""}`
                            : `/${link.slug || ""}`
                        }
                        target={
                          link.linkType === "external" ? "_blank" : undefined
                        }
                        rel={
                          link.linkType === "external"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="block text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                      >
                        {link.displayName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Fallback columns if no Sanity data
              <>
                {/* Services */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm text-neutral-300 mb-4">Services</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {["Marketing", "Social", "Design"].map(
                        (service, index) => (
                          <p
                            key={index}
                            className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                          >
                            {service}
                          </p>
                        )
                      )}
                    </div>
                    <div className="space-y-2">
                      {["AR/VR", "POS", "Campaign"].map((service, index) => (
                        <p
                          key={index}
                          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {service}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cases */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm text-neutral-300 mb-4">Cases</h3>
                  <div className="space-y-2">
                    {[
                      "EA Games",
                      "SAMSUNG",
                      "MICROSOFT",
                      "META",
                      "MARSHALL",
                      "BLIZZARD",
                    ].map((caseItem, index) => (
                      <p
                        key={index}
                        className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                      >
                        {caseItem}
                      </p>
                    ))}
                  </div>
                </div>

                {/* About Us */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm text-neutral-300 mb-4">About us</h3>
                  <div className="space-y-2">
                    {["Our Story", "We are Special", "Work with us"].map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Legal */}
                <div className="lg:col-span-2">
                  <h3 className="text-sm text-neutral-300 mb-4">Legal</h3>
                  <div className="space-y-2">
                    {["Disclaimer", "Data Protection", "Terms of Use"].map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Footer Bottom */}
      <div className="bg-neutral-900 text-gray-400 border-t pb-8 border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-24">
            {/* Social Media Icons */}
            <div className="flex gap-4 items-center">
              {menuData?.socialLinks && menuData.socialLinks.length > 0 ? (
                menuData.socialLinks
                  .filter((s) => !!s?.url)
                  .map((social) => (
                    <Link
                      key={social._key}
                      href={social.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                      aria-label={social.name || "social"}
                    >
                      {social.icon?.secure_url && (
                        <Image
                          src={social.icon.secure_url}
                          alt={social.name || "social"}
                          width={24}
                          height={24}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </Link>
                  ))
              ) : (
                // Fallback social links
                <>
                  <Link
                    href="#"
                    className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                    aria-label="Meta"
                  >
                    <Image
                      src="/MetaLogo.svg"
                      alt="Meta"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </Link>
                  <Link
                    href="#"
                    className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <Image
                      src="/InstagramLogo.svg"
                      alt="Instagram"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </Link>
                  <Link
                    href="#"
                    className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                    aria-label="TikTok"
                  >
                    <Image
                      src="/TiktokLogo.svg"
                      alt="TikTok"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </Link>
                  <Link
                    href="#"
                    className="w-6 h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <Image
                      src="/LinkedinLogo.svg"
                      alt="LinkedIn"
                      width={24}
                      height={24}
                      className="w-full h-full"
                    />
                  </Link>
                </>
              )}
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1">
              {/* Company Info */}
              <div className="flex-1">
                <h3 className="text-gray-400 text-[15px] font-medium mb-4">
                  {menuData?.addressTitle || "Super* international"}
                </h3>
                <div className="space-y-4">
                  {menuData?.locations && menuData.locations.length > 0 ? (
                    menuData.locations.map((location) => (
                      <React.Fragment key={location._key}>
                        {location.name && (
                          <div className="mb-1">
                            <p className="text-gray-400 text-[13px] leading-relaxed">
                              {location.name}
                            </p>
                          </div>
                        )}
                        {location.address && (
                          <div className="border-b border-gray-700 pb-3">
                            <p className="text-gray-400 text-[11px] leading-relaxed whitespace-pre-line">
                              {location.address}
                            </p>
                          </div>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <>
                      <div className=" pb-1">
                        <p className="text-gray-400 text-[12px] leading-relaxed">
                          Mallorca
                        </p>
                      </div>
                      <div className="border-b border-gray-700 pb-3">
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Address
                        </p>
                      </div>
                    </>
                  )}
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
                    className="w-full bg-transparent border border-gray-700 text-gray-400 text-[11px] py-3 px-3 hover:border-lime-400 hover:text-lime-400 transition-colors duration-200 focus:outline-none focus:border-lime-400 focus:text-lime-400"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Copyright */}
          {menuData?.copyright && (
            <div className="mt-8 pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs text-center">
                {menuData.copyright}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Footer;
