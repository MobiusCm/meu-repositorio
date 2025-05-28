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
import { useRouter } from "next/navigation"

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

export function UpdatePasswordForm() {
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    setIsPending(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar senha",
          description: error.message,
        })
        return
      }

      toast({
        title: "Senha atualizada com sucesso",
        description: "Sua senha foi atualizada. Você será redirecionado para o login.",
      })

      // Redirecionar para o login após atualização bem-sucedida
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium">Atualizar senha</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digite sua nova senha abaixo
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <Label htmlFor="password" className="text-sm font-normal text-muted-foreground">
            Nova senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="h-11 rounded-xl bg-secondary/30 px-4 transition-all focus-visible:ring-1 focus-visible:ring-primary"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-sm font-normal text-muted-foreground">
            Confirmar senha
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            className="h-11 rounded-xl bg-secondary/30 px-4 transition-all focus-visible:ring-1 focus-visible:ring-primary"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
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
              Atualizando...
            </>
          ) : (
            "Atualizar senha"
          )}
        </Button>
      </form>
    </div>
  )
} 