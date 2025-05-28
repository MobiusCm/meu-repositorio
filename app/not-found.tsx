import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="absolute top-10 md:top-16">
        <Image 
          src="/logo.svg" 
          alt="001Dash Logo" 
          width={40}
          height={40} 
          className="mx-auto"
          priority
        />
      </div>
      <div className="text-center max-w-md px-4">
        <h1 className="text-7xl font-medium text-primary mb-6">404</h1>
        <h2 className="text-xl font-medium mb-2">Página não encontrada</h2>
        <p className="text-sm text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button 
          asChild
          className="h-11 rounded-xl transition-all bg-primary hover:bg-primary/90 px-8"
        >
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 001Dash. Todos os direitos reservados.</p>
      </div>
    </div>
  )
} 