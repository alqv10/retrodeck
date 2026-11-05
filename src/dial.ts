/**
 * Dónde cae una canción en el dial, de 0 a 1. El hash hace que la emisora sea
 * estable: volver a la pista anterior devuelve la aguja a donde estaba, y dos
 * pistas seguidas casi nunca caen en el mismo lugar.
 *
 * FNV-1a con un mezclado final: sumando y multiplicando nomás, los ids cortos o
 * parecidos ("1", "2", "3") caían todos en el mismo milímetro del vidrio.
 *
 * Devuelve la fracción y no el porcentaje porque dónde empieza y termina el
 * vidrio lo decide la carcasa, que es la que sabe cuánto ocupan las etiquetas
 * de los extremos.
 */
export function station(id: string) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i += 1) hash = Math.imul(hash ^ id.charCodeAt(i), 0x01000193);
  hash = Math.imul(hash ^ (hash >>> 13), 0x5bd1e995);
  return (((hash ^ (hash >>> 15)) >>> 0) % 1000) / 1000;
}
