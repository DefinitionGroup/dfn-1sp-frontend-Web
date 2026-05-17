"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FooterMenu } from "@1sp/sanity-types/menu";
import Image from "next/image";
import { hasVisibleText } from "@/lib/text-content";

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
      <footer className={`bg-neutral-900 text-neutral-200 mt-5 md:mt-12 py-6 sm:py-8 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          {/* Top border line */}

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-6 sm:gap-8 min-h-[120px] lg:min-h-[163px]">
            {/* Company Logo */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-3 flex flex-col justify-center gap-3 mb-4 lg:mb-0">
              <Image
                src={menuData?.imageCloud?.secure_url || "/1sp-fallback.svg"}
                alt="Logo"
                width={120}
                height={64}
                className="  w-[120px] h-[64px]"
              />
            </div>

            {/* Dynamic Footer Columns from Sanity */}
            {menuData?.footerColumns && menuData.footerColumns.length > 0 ? (
              menuData.footerColumns.map((column) => (
                <div key={column._key} className="col-span-1 sm:col-span-2 lg:col-span-2">
                  {hasVisibleText(column.title) ? (
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-300 mb-3 sm:mb-4">
                      {column.title}
                    </h3>
                  ) : null}
                  <div className="space-y-1.5 sm:space-y-2">
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
                        className="block text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
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
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <h3 className="text-xs sm:text-sm text-neutral-300 mb-3 sm:mb-4">Services</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {["Marketing", "Social", "Design", "AR/VR", "POS", "Campaign"].map(
                      (service, index) => (
                        <p
                          key={index}
                          className="text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {service}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Cases */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <h3 className="text-xs sm:text-sm text-neutral-300 mb-3 sm:mb-4">Cases</h3>
                  <div className="space-y-1.5 sm:space-y-2">
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
                        className="text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                      >
                        {caseItem}
                      </p>
                    ))}
                  </div>
                </div>

                {/* About Us */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <h3 className="text-xs sm:text-sm text-neutral-300 mb-3 sm:mb-4">About us</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {["Our Story", "We are Special", "Work with us"].map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* Legal */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                  <h3 className="text-xs sm:text-sm text-neutral-300 mb-3 sm:mb-4">Legal</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    {["Disclaimer", "Data Protection", "Terms of Use"].map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-xs sm:text-sm text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
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
      <div className="bg-neutral-900 text-gray-400 border-t pb-6 sm:pb-8 border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col gap-6 sm:gap-3 lg:flex-row lg:justify-between lg:items-start lg:gap-20">


            {/* Main Content */}
            <div className="flex  sm:grid-cols-2  flex-1">
              {/* Company Info */}
              <div className=" flex w-full lg:w-auto">


                <div className="flex gap-4 w-1/2 items-center   justify-start  ">
                  {menuData?.socialLinks && menuData.socialLinks.length > 0 ? (
                    menuData.socialLinks
                      .filter((s) => !!s?.url)
                      .map((social) => (
                        <Link
                          key={social._key}
                          href={social.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
                          aria-label={social.name || "social"}
                        >
                          {social.icon?.secure_url && (
                            <div className="flex items-center gap-2">
                              <Image
                                src={social.icon.secure_url}
                                alt={social.name || "social"}
                                width={64}
                                height={64}
                                className="w-full h-full object-contain"
                              />
                              <p className="text-xs text-white">{social.name || "social"}</p>
                            </div>
                          )}
                        </Link>
                      ))
                  ) : (
                    // Fallback social links
                    <>
                      <Link
                        href="#"
                        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
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
                        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
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
                        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
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
                        className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-lime-400 transition-colors duration-200"
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
              </div>


            </div>
          </div>

          {/* Copyright */}
          {menuData?.copyright && (
            <div className="mt-2  ">
              <p className="text-gray-500 text-[10px] sm:text-xs text-left">
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
