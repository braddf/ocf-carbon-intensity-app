import React from "react";

export const LoadingSpinner = () => <div
  className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-10">
  <svg className="w-16 animate-spin" viewBox="0 0 50 50">
    <circle
      className="ring-track"
      fill="transparent"
      strokeWidth="4px"
      stroke="#9c9c9cff"
      cx="25" cy="25"
      r="22"
    />
    <circle
      className="ring-track"
      fill="transparent"
      strokeWidth="4px"
      stroke="#ffffff"
      cx="25" cy="25"
      strokeDashoffset="30"
      strokeDasharray="30 60"
      r="22"
    />
  </svg>
</div>;
