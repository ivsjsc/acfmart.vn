import React from 'react';

export function Partners() {
  const partners = [
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/1.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/1.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/2.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/3.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/5.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/6.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/04/7.png',
    'https://www.trungtamacf.vn/wp-content/uploads/2025/08/FECPI-scaled.jpg',
    '/photos/ivsjsc.png'
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12 uppercase">ĐỐI TÁC</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center w-full h-20 md:h-24 p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-300">
              <img 
                src={partner} 
                alt={`Đối tác ${index + 1}`} 
                className="max-w-full max-h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/150x80/f3f4f6/9ca3af?text=Logo';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
