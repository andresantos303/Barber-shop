import type { Metadata } from "next";
import { CONTACT, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como tratamos os dados pessoais recolhidos através deste site.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="text-xs font-medium uppercase tracking-wide text-primary">Legal</span>
      <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
        Política de Privacidade
      </h1>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground sm:text-base">
        <p>
          A {SITE_NAME} recolhe apenas os dados pessoais estritamente necessários para gerir os seus
          agendamentos: nome, número de telefone e endereço de email. Estes dados são utilizados
          exclusivamente para confirmar, gerir e, se necessário, cancelar a sua marcação.
        </p>
        <p>
          Não partilhamos os seus dados com terceiros para fins de marketing. Os dados são conservados
          apenas durante o tempo necessário para a gestão do agendamento e cumprimento de obrigações
          legais.
        </p>
        <p>
          Este site utiliza cookies essenciais ao funcionamento do mesmo. Pode a qualquer momento
          solicitar o acesso, retificação ou eliminação dos seus dados pessoais, contactando-nos através
          de{" "}
          <a href={`mailto:${CONTACT.email}`} className="underline hover:text-foreground">
            {CONTACT.email}
          </a>
          .
        </p>
        <p className="text-xs italic">
          Este texto é um modelo provisório e deve ser revisto por um profissional jurídico antes do
          lançamento do site, de forma a garantir total conformidade com o RGPD.
        </p>
      </div>
    </div>
  );
}
