import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { OmnysLogo } from "@/components/ui/omnys-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div>
          <OmnysLogo size="xl" variant="gradient" className="mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Plataforma de análise para WhatsApp
          </p>
        </div>

        {/* 404 Card */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-6xl font-light text-muted-foreground mb-2">404</h1>
              <h2 className="text-xl font-medium mb-2">Página não encontrada</h2>
              <p className="text-sm text-muted-foreground">
                A página que você está procurando não existe ou foi movida.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full" size="lg">
                  <Home className="mr-2 h-4 w-4" />
                  Ir para Dashboard
                </Button>
              </Link>
              <Button variant="outline" onClick={() => window.history.back()} className="w-full" size="lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Omnys. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
} 