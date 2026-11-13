/**
 * Servicio de clientes. Cada local tiene su propia lista de clientes.
 * Se usa para autocompletar los datos en la factura:
 *  - por identificación exacta (al salir del campo «Identificación»);
 *  - por nombre (sugerencias mientras se escribe «Nombre del cliente»).
 */
import "server-only";
import { and, asc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { clientes } from "@/db/schema";
import { escaparLike, normalizarTexto } from "@/lib/formato";

/** Columnas que se devuelven para llenar la factura. */
const COLUMNAS_CLIENTE = {
  identificacion: clientes.identificacion,
  nombre: clientes.nombre,
  telefono: clientes.telefono,
  direccion: clientes.direccion,
  sector: clientes.sector,
};

/** Máximo de sugerencias por búsqueda: suficientes para elegir sin llenar la pantalla. */
export const MAX_SUGERENCIAS_CLIENTE = 8;

export async function buscarClientePorIdentificacion(localId: string, identificacion: string) {
  const [cliente] = await db
    .select(COLUMNAS_CLIENTE)
    .from(clientes)
    .where(and(eq(clientes.localId, localId), eq(clientes.identificacion, identificacion.trim())))
    .limit(1);
  return cliente ?? null;
}

/**
 * Nombre del cliente en minúsculas y sin tildes, calculado en la base de datos
 * (equivale a normalizarTexto de src/lib/formato.ts para las letras del español).
 */
const nombreSinTildes = sql`translate(lower(${clientes.nombre}), 'áéíóúüñàèìòù', 'aeiouunaeiou')`;

/**
 * Clientes cuyo nombre contiene TODAS las palabras escritas, en cualquier orden,
 * sin distinguir mayúsculas ni tildes ("perez maria" encuentra a "María Pérez").
 */
export async function buscarClientesPorNombre(localId: string, texto: string) {
  const palabras = normalizarTexto(texto).split(" ").filter(Boolean);
  if (palabras.length === 0) return [];
  return db
    .select(COLUMNAS_CLIENTE)
    .from(clientes)
    .where(and(eq(clientes.localId, localId), ...palabras.map((p) => ilike(nombreSinTildes, `%${escaparLike(p)}%`))))
    .orderBy(asc(clientes.nombre))
    .limit(MAX_SUGERENCIAS_CLIENTE);
}
