"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade-in">
      <div className="bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg text-center">
        {message}
      </div>
    </div>
  );
}
