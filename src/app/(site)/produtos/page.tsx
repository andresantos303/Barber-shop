import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";
import { getActiveProducts } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Produtos de cuidado masculino disponíveis na nossa barbearia, à venda em loja.",
};

export default async function ProdutosPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
          <ShoppingBag className="size-3.5" /> Loja
        </span>
        <h1 className="font-heading mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
          Produtos de Cuidado Masculino
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Leve para casa os produtos que usamos no nosso espaço. Disponíveis para compra em loja.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            headingLevel="h2"
            name={product.name}
            brand={product.brand}
            description={product.description}
            priceCents={product.priceCents}
            imageUrl={product.imageUrl}
          />
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-12 text-sm text-muted-foreground">Brevemente disponível.</p>
      )}
    </div>
  );
}
