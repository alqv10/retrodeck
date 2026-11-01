/**
 * Dónde cae una canción en el dial, de 0 a 1. El hash hace que la emisora sea
 * estable: volver a la pista anterior devuelve la aguja a donde estaba, y dos
 * pistas seguidas casi nunca caen en el mismo lugar.
 *
 * Devuelve la fracción y no el porcentaje porque dónde empieza y termina el
 * vidrio lo decide la carcasa, que es la que sabe cuánto ocupan las etiquetas
 * de los extremos.
 */
export function station(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash % 1000) / 1000;
}
