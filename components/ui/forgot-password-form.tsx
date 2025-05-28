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
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm() {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsPending(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao enviar email",
          description: error.message,
        })
        return
      }

      setIsSuccess(true)
      toast({
        title: "Email enviado com sucesso",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
      })
    } finally {
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-medium">Verifique seu email</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enviamos um link para redefinir sua senha.
          </p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            asChild
            className="h-11 rounded-xl transition-all hover:bg-secondary/50"
          >
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-medium">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Digite seu email para receber um link de recuperação
        </p>
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
        <Button 
          type="submit" 
          className="w-full h-11 rounded-xl transition-all bg-primary hover:bg-primary/90"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar link"
          )}
        </Button>
      </form>
      <div className="text-center">
        <Link
          href="/auth/login"
          className="text-xs text-primary hover:opacity-80 transition-opacity"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
} 