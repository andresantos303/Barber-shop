import type { Metadata } from "next";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description: "Conheça a história e os valores da barbearia André Cabeleireiro, em Seixezelo.",
};

export default function SobreNosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">Sobre Nós</span>
      <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
        Uma barbearia com tradição, em Seixezelo
      </h1>

      <div className="mt-8 flex aspect-[16/7] items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-card">
        <Scissors className="size-12 text-primary/60" />
      </div>

      <div className="mt-10 space-y-5 text-sm text-muted-foreground sm:text-base">
        <p>
          Há vários anos que a André Cabeleireiro cuida da imagem dos homens de Seixezelo e da região.
          Combinamos as técnicas clássicas de barbearia com as tendências mais atuais, num espaço pensado
          para que se sinta confortável do início ao fim do seu atendimento.
        </p>
        <p>
          A nossa equipa é formada por profissionais experientes, dedicados a perceber exatamente o que
          procura — seja um corte clássico, uma barba bem definida, ou um visual completamente novo.
        </p>
        <p>
          Acreditamos que cuidar de si é mais do que um corte de cabelo: é um momento para parar, relaxar
          e sair com mais confiança.
        </p>
      </div>

      <div className="mt-10">
        <Link href="/agendar" className={cn(buttonVariants({ variant: "default" }), "h-12 px-8 text-base")}>
          Agendar Agora
        </Link>
      </div>
    </div>
  );
}
