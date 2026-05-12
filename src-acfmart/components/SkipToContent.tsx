import React from 'react';

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-red focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
    >
      Bỏ qua đến nội dung chính
    </a>
  );
}
