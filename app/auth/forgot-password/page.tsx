import { ForgotPasswordForm } from "@/components/ui/forgot-password-form"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function ForgotPasswordPage() {
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
      <Card className="w-full max-w-md border-none bg-background/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-8 md:p-10">
          <ForgotPasswordForm />
        </CardContent>
      </Card>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 001Dash. Todos os direitos reservados.</p>
      </div>
    </div>
  )
} 