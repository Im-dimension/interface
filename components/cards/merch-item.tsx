import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";

export interface MerchItemProps {
  id: number;
  name: string;
  price: string;
  thumbnail: string;
  onBuy: (name: string) => void;
}

export function MerchItem({ name, price, thumbnail, onBuy }: MerchItemProps) {
  const [imgSrc, setImgSrc] = useState(thumbnail || "/logo.jpg");

  return (
    <div className="flex items-center gap-4 p-3 sm:p-4 bg-[#f4d4a0] rounded-2xl border-4 border-dashed border-[#d4a520]/40 shadow-lg hover:shadow-xl transition-shadow">
      {/* Thumbnail */}
      <div className="w-20 h-20 md:w-24 md:h-24 flex shrink-0 rounded-xl overflow-hidden border-2 border-purple-600/20 bg-[#f3a8c7]">
        <Image
          src={imgSrc}
          alt={name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
          onError={() => setImgSrc("/logo.jpg")}
        />
      </div>

      {/* Item Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="text-lg font-bold text-[#4a2a1f] line-clamp-2">{name}</h3>
        <p className="text-sm font-semibold text-[#4a2a1f]/80 line-clamp-2">{price}</p>
      </div>

      {/* Buy Button */}
      <Button
        label="Buy"
        onClick={() => onBuy(name)}
        className="flex shrink-0 py-2! px-5! text-base! md:py-3! md:text-lg!"
      />
    </div>
  );
}
