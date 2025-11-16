import Image from "next/image";
import { useState } from "react";

export function NFTCard({
  imageUrl,
  imageAlt,
  name,
  description,
  tokenId,
}: {
  imageUrl: string;
  imageAlt: string;
  name?: string;
  description?: string;
  tokenId?: string;
}) {
  const [imgSrc, setImgSrc] = useState(imageUrl || "/placeholder.svg");

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden">
      <Image
        src={imgSrc}
        alt={imageAlt}
        className="w-full h-auto max-h-[70vh] object-cover mx-auto"
        width={300}
        height={100}
        priority={false}
        onError={() => {
          setImgSrc("/placeholder.svg");
        }}
      />

      {(name || description || tokenId) && (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-4">
          <div className="space-y-1 text-white text-left">
            {name && <h3 className="text-lg font-bold">{name}</h3>}
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
            {tokenId && (
              <p className="text-xs opacity-75">Token ID: {tokenId}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
