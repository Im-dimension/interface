"use client";

import { MerchItem } from "@/components/cards/merch-item";

const merchItems = [
  {
    id: 1,
    name: "Sub0 T-Shirt",
    price: "$29.99",
    thumbnail: "/placeholder-tshirt.jpg",
  },
  {
    id: 2,
    name: "Sub0 Hoodie",
    price: "$49.99",
    thumbnail: "/placeholder-hoodie.jpg",
  },
  {
    id: 3,
    name: "Sub0 Cap",
    price: "$19.99",
    thumbnail: "/placeholder-cap.jpg",
  },
  {
    id: 4,
    name: "Sub0 Sticker Pack",
    price: "$9.99",
    thumbnail: "/placeholder-stickers.jpg",
  },
];

export default function StorePage() {
  const handleBuy = (itemName: string) => {
    console.log(`Buying: ${itemName}`);
    // Add your purchase logic here
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-6">
      <h1 className="text-yellow-500 text-2xl md:text-3xl font-bold mb-6">Merchandise Store</h1>
      <div className="space-y-4">
        {merchItems.map((item) => (
          <MerchItem key={item.id} {...item} onBuy={handleBuy} />
        ))}
      </div>
    </div>
  );
}
