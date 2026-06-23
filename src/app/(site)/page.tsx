import Link from "next/link";
import { Scissors, Sparkles, Users, ShoppingBag, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveBarbers, getActiveProducts, getActiveServices } from "@/lib/data";
import { ProductCard } from "@/components/products/product-card";

const CATEGORY_ICONS: Record<string, typeof Scissors> = {
  Corte: Scissors,
  Barba: Sparkles,
  "Não Categorizado": Sparkles,
};

export default async function Home() {
  const [barbers, services, products] = await Promise.all([
    getActiveBarbers(),
    getActiveServices(),
    getActiveProducts(),
  ]);

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const featuredProducts = products.slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,var(--primary),transparent_85%),_transparent_60%)]" />
        <div className="mx-auto flex max-w-6xl flex-col items-start px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium tracking-wide text-primary uppercase">
            <Scissors className="size-3.5" /> Barbearia em Seixezelo
          </span>
          <h1 className="font-heading max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Tradição e estilo, <span className="italic text-primary">à sua medida.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Corte, barba e tratamentos de cuidado masculino, num espaço pensado para se sentir bem
            consigo próprio. Marque o seu horário em menos de um minuto.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/agendar" className={cn(buttonVariants({ variant: "default" }), "h-12 px-8 text-base")}>
              Agendar Agora
            </Link>
            <Link href="/servicos" className={cn(buttonVariants({ variant: "outline" }), "h-12 px-8 text-base")}>
              Ver Serviços
            </Link>
          </div>
        </div>
      </section>

      {/* Services teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">Os Nossos Serviços</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Do corte clássico aos tratamentos de barba, há sempre um serviço à sua medida.
            </p>
          </div>
          <Link
            href="/servicos"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Ver tudo <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category] ?? Scissors;
            const count = services.filter((s) => s.category === category).length;
            return (
              <Link
                key={category}
                href="/servicos"
                className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <Icon className="size-8 text-primary" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">{category}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {count} {count === 1 ? "serviço" : "serviços"} disponíveis
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Saber mais <ArrowRight className="size-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Barbers teaser */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">A Nossa Equipa</h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Profissionais experientes, prontos para cuidar do seu visual.
              </p>
            </div>
            <Link
              href="/equipa"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
            >
              Ver equipa <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => (
              <div key={barber.id} className="rounded-2xl border border-border bg-card p-6 text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-secondary">
                  <Users className="size-9 text-primary" />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{barber.name}</h3>
                <Link
                  href={`/agendar?barberId=${barber.id}`}
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Agendar com {barber.name.split(" ")[0]}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products teaser — elevated visibility per redesign brief */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
              <ShoppingBag className="size-3.5" /> Loja
            </span>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              Produtos de Cuidado Masculino
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Leve para casa os produtos que usamos no nosso espaço.
            </p>
          </div>
          <Link
            href="/produtos"
            className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
          >
            Ver todos <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              size="sm"
              name={product.name}
              brand={product.brand}
              priceCents={product.priceCents}
              imageUrl={product.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Pronto para o seu próximo corte?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Escolha o serviço, o barbeiro e o horário que melhor lhe convém — tudo em poucos minutos.
          </p>
          <Link
            href="/agendar"
            className={cn(buttonVariants({ variant: "default" }), "mt-8 h-12 px-8 text-base")}
          >
            Agendar Agora
          </Link>
        </div>
      </section>
    </>
  );
}
