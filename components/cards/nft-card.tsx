import Image from "next/image";
import { useState } from "react";

export function NFTCard({
  imageUrl,
  imageAlt,
  name,
  description,
  tokenId,
  videoUrl,
  onClick,
}: {
  imageUrl: string;
  imageAlt: string;
  name?: string;
  description?: string;
  tokenId?: string;
  videoUrl?: string;
  onClick?: () => void;
}) {
  const [imgSrc, setImgSrc] = useState(imageUrl || "/placeholder.svg");
  const isVideo = !!videoUrl;

  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl overflow-hidden ${
        isVideo ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
      }`}
      onClick={isVideo ? onClick : undefined}
    >
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

      {/* Play button overlay for video NFTs */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 sm:p-6 shadow-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 sm:h-16 sm:w-16 text-black"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

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
