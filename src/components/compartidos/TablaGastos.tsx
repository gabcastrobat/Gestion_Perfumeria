/**
 * Lista de gastos con sus totales (la usan el vendedor y el administrador).
 * Los gastos del negocio y los «Gastos personales» (de la dueña) se muestran en secciones separadas:
 * los personales no se restan de la utilidad.
 * Si se indica "onEliminar", los gastos que se pueden eliminar muestran el botón.
 */
"use client";

import { useId } from "react";
import { fechaDia, pesos } from "@/lib/formato";
import { textoMedioPago } from "@/lib/pagos";
import type { GastoFila, ListaGastos } from "@/tipos";
import { Insignia, Vacio } from "../ui/Basicos";
import { Boton } from "../ui/Boton";

export function TotalesGastos({ datos }: { datos: ListaGastos }) {
  const totales = [
    { titulo: "Gastos del negocio", valor: datos.total, detalle: "Se restan de la utilidad" },
    { titulo: "Pagado en efectivo", valor: datos.totalEfectivo, detalle: "Gastos del negocio" },
    { titulo: "Pagado por transferencia", valor: datos.totalTransferencia, detalle: "Gastos del negocio" },
    { titulo: "Gastos personales", valor: datos.totalPersonales, detalle: "Aparte: no se restan de la utilidad" },
  ];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {totales.map((t) => (
        <li key={t.titulo} className="rounded-2xl border border-linea bg-tarjeta p-4 shadow-sm">
          <p className="text-lg font-bold text-texto-suave">{t.titulo}</p>
          <p className="mt-1 text-2xl font-bold text-acento sm:text-3xl">{pesos(t.valor)}</p>
          <p className="text-base text-texto-suave">{t.detalle}</p>
        </li>
      ))}
    </ul>
  );
}

export function TablaGastos({ gastos, onEliminar }: { gastos: GastoFila[]; onEliminar?: (gasto: GastoFila) => void }) {
  if (gastos.length === 0) {
    return (
      <Vacio icono="dinero" titulo="No hay gastos para mostrar">
        Prueba con otro mes o categoría.
      </Vacio>
    );
  }

  const delNegocio = gastos.filter((g) => !g.personal);
  const personales = gastos.filter((g) => g.personal);

  return (
    <div className="space-y-8">
      <SeccionGastos titulo="Gastos del negocio" vacio="No hay gastos del negocio en este periodo." gastos={delNegocio} onEliminar={onEliminar} />
      {personales.length > 0 && (
        <SeccionGastos
          titulo="Gastos personales"
          descripcion="Gastos propios de la dueña: se ven aparte y no se restan de la utilidad."
          gastos={personales}
          onEliminar={onEliminar}
        />
      )}
    </div>
  );
}

function SeccionGastos({
  titulo,
  descripcion,
  vacio,
  gastos,
  onEliminar,
}: {
  titulo: string;
  descripcion?: string;
  vacio?: string;
  gastos: GastoFila[];
  onEliminar?: (gasto: GastoFila) => void;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="text-2xl font-bold">
        {titulo} <span className="text-lg font-normal text-texto-suave">({gastos.length})</span>
      </h3>
      {descripcion && <p className="mb-3 text-base text-texto-suave">{descripcion}</p>}
      {gastos.length === 0 ? (
        <p className="mt-2 text-lg text-texto-suave">{vacio}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {gastos.map((g) => (
            <li key={g.id} className="flex flex-col gap-3 rounded-2xl border border-linea bg-tarjeta p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h4 className="text-xl font-bold">{g.categoriaNombre}</h4>
                {g.descripcion && <p className="text-lg break-words">{g.descripcion}</p>}
                <p className="text-base text-texto-suave">
                  {fechaDia(g.fecha)} · Registrado por {g.usuarioNombre}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Insignia tono={g.medioPago === "EFECTIVO" ? "marca" : "info"}>{textoMedioPago(g.medioPago)}</Insignia>
                  {g.personal && <Insignia tono="alerta">Personal · no se resta</Insignia>}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <p className="text-2xl font-bold text-acento">{pesos(g.valor)}</p>
                {onEliminar && g.puedeEliminar && (
                  <Boton pequeno variante="secundario" icono="basura" onClick={() => onEliminar(g)}>
                    Eliminar
                  </Boton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
