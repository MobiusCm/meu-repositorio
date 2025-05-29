import { UpdatePasswordForm } from "@/components/ui/update-password-form"
import { Card, CardContent } from "@/components/ui/card"
import { OmnysLogo } from "@/components/ui/omnys-logo"

export default function UpdatePasswordPage() {
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

        {/* Update Password Card */}
        <Card className="border-0 shadow-sm bg-card">
          <CardContent className="p-6">
            <UpdatePasswordForm />
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