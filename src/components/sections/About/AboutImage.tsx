import React from "react";

/**
 * Decorative portrait. It is deliberately not interactive: the earlier
 * `cursor-pointer` and press-scale promised a click that no handler ever
 * answered, and offered nothing at all to a keyboard user.
 *
 * The `group-active` colour reveal stays. It is not press feedback, it is
 * the touch counterpart of the hover reveal, since `:hover` is unreliable
 * on touch devices.
 */
export interface AboutImageProps {
  imageUrl: string;
  /** The file's own dimensions, so the space is reserved before it loads. */
  width: number;
  height: number;
}

export const AboutImage: React.FC<AboutImageProps> = ({ imageUrl, width, height }) => {
  return (
    <div className="relative group print:hidden">
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 group-active:opacity-50 transition duration-1000 group-hover:duration-200 group-active:duration-200"></div>
      <div className="relative rounded-xl bg-[#0f172a] border border-white/10 overflow-hidden flex items-center justify-center group/img p-2 sm:p-4">
        <img
          itemProp="image"
          src={imageUrl}
          alt="Portrait of Remigiusz Bednarczyk"
          loading="lazy"
          width={width}
          height={height}
          className="w-full h-auto max-h-[600px] object-contain rounded-lg grayscale group-hover/img:grayscale-0 group-active/img:grayscale-0 transition-all duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay pointer-events-none group-hover/img:opacity-0 group-active/img:opacity-0 transition-opacity duration-500"></div>
      </div>
    </div>
  );
};
