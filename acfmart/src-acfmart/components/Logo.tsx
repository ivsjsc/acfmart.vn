import logoImg from '../../assets/logo.png'
import logovImg from '../../assets/logov.png'

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const className = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'
  
  return (
    <div className="flex items-center gap-2">
      <img 
        src={logoImg} 
        alt="ACFMart - Sàn thương mại điện tử chống hàng giả" 
        className={className}
      />
    </div>
  )
}

export function LogoSquare({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const className = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16'
  
  return (
    <img 
      src={logovImg} 
      alt="ACFMart Square Logo" 
      className={className}
    />
  )
}