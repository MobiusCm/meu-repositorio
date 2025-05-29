import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { OmnysLogo } from "@/components/ui/omnys-logo"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <OmnysLogo size="xl" variant="gradient" className="mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Plataforma de análise para WhatsApp
          </p>
        </div>

        {/* Error Card */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg mb-2">Erro de Autenticação</CardTitle>
            <CardDescription className="mb-6">
              Ocorreu um erro durante o processo de autenticação. Tente novamente.
            </CardDescription>
            <Link href="/auth/login">
              <Button className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Omnys. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
} 