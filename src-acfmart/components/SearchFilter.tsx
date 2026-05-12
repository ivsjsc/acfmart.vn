import React from 'react';
import { Filter } from 'lucide-react';

interface SearchFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchFilter({ isOpen, onClose }: SearchFilterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Filter className="w-6 h-6 mr-2" />
            Bộ lọc tìm kiếm
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">Bộ lọc đang được phát triển...</p>
        </div>
      </div>
    </div>
  );
}
