import type { Metadata } from "next";
import { SwaggerUiClient } from "@/components/admin/swagger-ui-client";

export const metadata: Metadata = { title: "API Docs" };

export default function ApiDocsPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Documentação da API</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Endpoints públicos de disponibilidade usados pelo fluxo de agendamento. Marcações e
        operações administrativas são feitas via Server Actions e não aparecem aqui.
      </p>
      {/* swagger-ui-react assumes a light page background, so it gets its own light card
          instead of inheriting the dark admin theme. */}
      <div className="mt-6 overflow-hidden rounded-xl bg-white">
        <SwaggerUiClient />
      </div>
    </div>
  );
}
