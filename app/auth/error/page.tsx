import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;
  const errorMessage = params.error || "Ocorreu um erro na autenticação"

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
        <CardContent className="p-8 md:p-10 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-medium">Erro de autenticação</h1>
          <p className="mb-6 text-sm text-muted-foreground">{errorMessage}</p>
          <Button 
            asChild
            className="h-11 rounded-xl transition-all bg-primary hover:bg-primary/90"
          >
            <Link href="/auth/login">Voltar para login</Link>
          </Button>
        </CardContent>
      </Card>
      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} 001Dash. Todos os direitos reservados.</p>
      </div>
    </div>
  )
} 