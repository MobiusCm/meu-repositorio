import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getSession()

  // Se o usuário não estiver autenticado e estiver tentando acessar uma rota protegida
  if (!data.session && !request.nextUrl.pathname.startsWith("/auth")) {
    // Redirecionar para a página de login
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Se o usuário estiver autenticado e estiver tentando acessar uma página de autenticação
  if (data.session && request.nextUrl.pathname.startsWith("/auth")) {
    // Redirecionar para o dashboard
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Se o usuário estiver autenticado e estiver na raiz, redirecionar para dashboard
  if (data.session && request.nextUrl.pathname === "/") {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Configuração para aplicar o middleware a todas as rotas exceto as especificadas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg).*)"],
} 