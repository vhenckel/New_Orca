import { Link } from "react-router-dom";

import { Button } from "@/shared/ui/button";

export function ForgotPasswordPage() {
  return (
    <div className="fixed inset-0 flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0a4a8a] to-[#0a1a3e] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/35 bg-white/10 p-8 text-center backdrop-blur-xl">
        <h1 className="mb-2 text-xl font-semibold text-white">
          Esqueci minha senha
        </h1>
        <p className="mb-6 text-sm text-white/90">
          Entre em contato com o suporte para redefinir sua senha.
        </p>
        <Button asChild variant="outline" className="border-white/50 bg-white/20 text-white hover:bg-white/30">
          <Link to="/login">Voltar ao login</Link>
        </Button>
      </div>
    </div>
  );
}
