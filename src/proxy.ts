// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas
  const publicRoutes = ["/", "/login"];
  const isCadastroRoute = pathname.startsWith("/cadastro");
  const isPublicRoute = publicRoutes.includes(pathname) || isCadastroRoute;

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar token de sessão
  const sessionToken = request.cookies.get("session_token")?.value;
  const userType = request.cookies.get("user_type")?.value;

  // Se não tem token, redireciona para login
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Validar tipo de usuário pela rota
  if (pathname.startsWith("/cliente") && userType !== "cliente") {
    return NextResponse.redirect(new URL(`/${userType}`, request.url));
  }

  if (pathname.startsWith("/comerciante") && userType !== "comerciante") {
    return NextResponse.redirect(new URL(`/${userType}`, request.url));
  }

  if (pathname.startsWith("/entregador") && userType !== "entregador") {
    return NextResponse.redirect(new URL(`/${userType}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
