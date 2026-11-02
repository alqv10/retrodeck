import type { CSSProperties } from "react";

/**
 * Las calcomanías pegadas en una carcasa. El aspecto —el canto troquelado, la
 * sombra, la inclinación hacia la de al lado— es el mismo en las cinco; cada
 * carcasa solo decide dónde va el grupo, desde su propio CSS.
 */
export function Stickers({ list }: { list?: string[] }) {
  if (!list || list.length === 0) return null;
  return (
    <div className="rd-stickers" aria-hidden="true">
      {list.map((src, i) => (
        <img
          key={src}
          className="rd-sticker"
          src={src}
          alt=""
          draggable={false}
          style={{ "--rd-tilt": `${i % 2 ? -5 : 7}deg` } as CSSProperties}
        />
      ))}
    </div>
  );
}
