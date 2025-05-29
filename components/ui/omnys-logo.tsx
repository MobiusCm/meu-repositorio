import { cn } from "@/lib/utils"

interface OmnysLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'minimal' | 'gradient'
}

export function OmnysLogo({ 
  className, 
  size = 'md', 
  variant = 'default' 
}: OmnysLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  const baseClasses = "font-light tracking-wider select-none"
  
  const variantClasses = {
    default: "text-foreground",
    minimal: "text-muted-foreground",
    gradient: "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent"
  }

  return (
    <div className={cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <span className="font-extralight">O</span>
      <span className="font-light">mn</span>
      <span className="font-normal">y</span>
      <span className="font-medium">s</span>
    </div>
  )
}

// Versão compacta para uso em ícones
export function OmnysIcon({ 
  className, 
  size = 20 
}: { 
  className?: string
  size?: number 
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-light",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.6 }}>O</span>
    </div>
  )
} 