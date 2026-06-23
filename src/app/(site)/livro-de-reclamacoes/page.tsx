import type { Metadata } from "next";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Livro de Reclamações",
  description: "Acesso ao livro de reclamações eletrónico, conforme exigido pela legislação portuguesa.",
};

export default function LivroDeReclamacoesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">Informação Legal</span>
      <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">Livro de Reclamações</h1>

      <p className="mt-6 text-sm text-muted-foreground sm:text-base">
        Este estabelecimento dispõe de livro de reclamações, nos termos da legislação em vigor. Caso não
        tenha ficado satisfeito com o nosso serviço, pode solicitar o livro de reclamações físico no
        local, ou apresentar a sua reclamação através do livro de reclamações eletrónico, acedendo ao
        portal oficial.
      </p>

      <a
        href={CONTACT.livroReclamacoesUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Aceder ao Livro de Reclamações Eletrónico
      </a>

      <p className="mt-8 text-xs text-muted-foreground">
        Em caso de litígio de consumo, o consumidor pode recorrer a uma Entidade de Resolução Alternativa
        de Litígios de Consumo. Mais informação em{" "}
        <a href="https://www.consumidor.gov.pt" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
          www.consumidor.gov.pt
        </a>
        .
      </p>
    </div>
  );
}
