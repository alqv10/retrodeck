/**
 * En qué punto del dial (0-100%) cae una canción. El hash hace que la emisora
 * sea estable: volver a la pista anterior devuelve la aguja a donde estaba, y
 * dos pistas seguidas casi nunca caen en el mismo lugar.
 */
export function station(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return 5 + ((hash % 1000) / 1000) * 90;
}
