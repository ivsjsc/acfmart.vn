import bannerDesktop from '../assets/banner-desktop.png';
import bannerMobile from '../assets/banner-mobile.png';

export function Banner() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-red-700/30 via-transparent to-brand-gold-500/10 opacity-70" />
      <picture className="absolute inset-0 w-full h-full object-cover mix-blend-overlay">
        {/* Mobile image - shown on small screens */}
        <source 
          media="(max-width: 767px)" 
          srcSet={bannerMobile} 
        />
        
        {/* Desktop image - default for larger screens */}
        <img 
          src={bannerDesktop} 
          alt="ACFMart Banner" 
          className="w-full h-full object-cover opacity-30"
        />
      </picture>
    </div>
  );
}