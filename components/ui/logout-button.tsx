"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

export function LogoutButton({ 
  variant = "default" as ButtonVariant, 
  className = "" 
}: { 
  variant?: ButtonVariant; 
  className?: string 
}) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  
  const handleLogout = async () => {
    setIsPending(true)
    try {
      await supabase.auth.signOut()
      router.refresh()
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta",
      })
      router.push("/auth/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar desconectar. Tente novamente.",
      })
    } finally {
      setIsPending(false)
    }
  }
  
  return (
    <Button 
      variant={variant} 
      onClick={handleLogout} 
      disabled={isPending}
      className={`transition-all hover:opacity-80 ${className}`}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="mr-2 h-4 w-4" />
      )}
      Sair
    </Button>
  )
} 