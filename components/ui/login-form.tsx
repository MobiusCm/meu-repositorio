"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        })
        return
      }

      // Redirecionar para o dashboard após login bem-sucedido
      router.push("/dashboard")
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium">Entre na sua conta</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-normal text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            disabled={isPending}
            className="h-11 rounded-xl bg-secondary/30 px-4 transition-all focus-visible:ring-1 focus-visible:ring-primary"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">
              Senha
            </Label>
            <Link 
              href="/auth/forgot-password" 
              className="text-xs text-primary hover:opacity-80 transition-opacity"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isPending}
            className="h-11 rounded-xl bg-secondary/30 px-4 transition-all focus-visible:ring-1 focus-visible:ring-primary"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl transition-all bg-primary hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>
      
      {/* Botão de teste para desenvolvimento */}
      <div className="mt-4 pt-4 border-t">
        <Button 
          type="button"
          variant="outline"
          className="w-full"
          onClick={async () => {
            // Login de teste para desenvolvimento
            const testEmail = "test@example.com";
            const testPassword = "123456";
            
            setIsPending(true);
            try {
              const { error } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword,
              });

              if (error) {
                // Se o usuário não existir, criar conta de teste
                const { error: signUpError } = await supabase.auth.signUp({
                  email: testEmail,
                  password: testPassword,
                  options: {
                    data: {
                      full_name: 'Usuário Teste'
                    }
                  }
                });
                
                if (signUpError) {
                  toast({
                    variant: "destructive",
                    title: "Erro ao criar conta de teste",
                    description: signUpError.message,
                  });
                  return;
                }
                
                toast({
                  title: "Conta de teste criada",
                  description: "Faça login com test@example.com / 123456",
                });
                return;
              }

              router.push("/dashboard");
              
              toast({
                title: "Login de teste realizado",
                description: "Bem-vindo!",
              });
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Erro no login de teste",
                description: "Ocorreu um erro inesperado.",
              });
            } finally {
              setIsPending(false);
            }
          }}
          disabled={isPending}
        >
          Login de Teste (Desenvolvimento)
        </Button>
      </div>
    </div>
  )
} 