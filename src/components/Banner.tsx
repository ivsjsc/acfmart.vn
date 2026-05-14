import bannerDesktop from '../assets/banner-desktop.png';
import bannerMobile from '../assets/banner-mobile.png';

export function Banner() {
  return (
    <div className="w-full">
      <picture>
        <source 
          media="(max-width: 767px)" 
          srcSet={bannerMobile} 
        />
        <img 
          src={bannerDesktop} 
          alt="ACFMart – Mua sắm chính hãng, an tâm 100%" 
          className="w-full h-auto"
        />
      </picture>
    </div>
  );
}