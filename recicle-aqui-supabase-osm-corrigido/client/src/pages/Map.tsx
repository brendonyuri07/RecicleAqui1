import { useState } from "react";
import { Link } from "wouter";
import AppShell from "@/components/AppShell";
import CollectionPointsMap from "@/components/CollectionPointsMap";
import QueryError from "@/components/QueryError";
import StatusBadge from "@/components/StatusBadge";
import { trpc } from "@/lib/trpc";

export default function MapPage() {
  const points = trpc.points.list.useQuery();
  const [selectedId, setSelectedId] = useState<number>();
  return (
    <AppShell hideFooter>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Mapa de pontos</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pontos de coleta verificados em Taquaritinga-SP.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Legend color="var(--success)" text="Ativo" />
            <Legend color="var(--warning)" text="Próximo da capacidade" />
            <Legend color="var(--danger)" text="Lotado" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="h-[55vh] min-h-[340px] lg:h-[70vh]">
            <CollectionPointsMap
              points={points.data ?? []}
              selectedId={selectedId}
            />
          </div>
          <aside className="card-soft max-h-[70vh] overflow-y-auto p-4">
            <h2 className="mb-3 font-semibold">
              Pontos{points.data ? ` (${points.data.length})` : ""}
            </h2>
            {points.isLoading ? (
              <p role="status" className="py-4 text-sm text-muted-foreground">
                Carregando pontos…
              </p>
            ) : points.isError ? (
              <QueryError
                compact
                title="Não foi possível carregar os pontos"
                retry={() => void points.refetch()}
              />
            ) : (
              <ul className="space-y-2">
                {points.data?.map(point => (
                  <li
                    key={point.id}
                    className={`rounded-xl border p-3 ${selectedId === point.id ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      aria-label={`Localizar ${point.name} no mapa`}
                      aria-pressed={selectedId === point.id}
                      onClick={() => setSelectedId(point.id)}
                    >
                      <span className="mb-2 block text-sm font-semibold">
                        {point.name}
                      </span>
                      <StatusBadge status={point.capacityStatus} />
                      <span className="mt-2 block text-xs text-muted-foreground">
                        {point.neighborhood} · {point.address}
                      </span>
                    </button>
                    <Link
                      href={`/pontos/${point.id}`}
                      className="mt-3 inline-block text-xs font-semibold text-primary underline underline-offset-4"
                    >
                      Ver detalhes
                    </Link>
                  </li>
                ))}
                {points.data?.length === 0 && (
                  <li className="py-6 text-center text-sm text-muted-foreground">
                    Ainda não há pontos aprovados.
                  </li>
                )}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
function Legend({ color, text }: { color: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {text}
    </span>
  );
}
