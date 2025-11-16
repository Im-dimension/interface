"use client";

import { MerchItem } from "@/components/cards/merch-item";
import { NFTDetails } from "@/components/cards/nft-details";

const merchItems = [
  {
    id: 1,
    name: "Chiri Fungi Night",
    price: "$29.99",
    thumbnail: "/chiri-fungi-night.png",
  },
  {
    id: 2,
    name: "Chiri Intersuit",
    price: "$49.99",
    thumbnail: "/chiri-intersuit.png",
  },
  {
    id: 3,
    name: "Chiri Pantuflas",
    price: "$19.99",
    thumbnail: "/Chiri-pantuflas.png",
  },
  {
    id: 4,
    name: "Chiri Pizza Mate Xoxo",
    price: "$9.99",
    thumbnail: "/chiri-pizza-mate-xoxo.png",
  },
];

export default function StorePage() {
  const handleBuy = (itemName: string) => {
    console.log(`Buying: ${itemName}`);
    // Add your purchase logic here
  };

  return (
    <>
      <div className="w-full h-full overflow-y-auto p-4 md:p-6">
        <h1 className="text-yellow-500 text-2xl md:text-3xl font-bold mb-6">
          Merchandise Store
        </h1>
        <div className="space-y-4">
          {merchItems.map((item) => (
            <MerchItem key={item.id} {...item} onBuy={handleBuy} />
          ))}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="flex justify-end sm:items-end gap-4 sm:gap-8">
        <NFTDetails
          name={`${merchItems.length} Item${
            merchItems.length === 1 ? "" : "s"
          }`}
          description="Your Impossible Dimension merchandise"
        />
      </div>
    </>
  );
}
