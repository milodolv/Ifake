import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-xl font-bold text-white mb-8">
        iFake
      </Link>
      <h1 className="text-2xl font-bold text-white mb-2">Accès éditeur</h1>
      <p className="text-white/50 text-sm mb-6 text-center">
        Outil interne — mot de passe requis
      </p>
      <LoginForm />
    </div>
  );
}
