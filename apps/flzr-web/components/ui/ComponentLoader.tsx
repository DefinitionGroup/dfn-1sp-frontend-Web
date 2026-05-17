import React from "react";

interface ComponentLoaderProps {
  className?: string;
  height?: string;
  text?: string;
}

export default function ComponentLoader({
  className = "",
  height = "h-64",
  text = "Loading...",
}: ComponentLoaderProps) {
  return (
    <div
      className={`w-full ${height} flex items-center justify-center ${className}`}
    >
      <div className="text-gray-400">{text}</div>
    </div>
  );
}
