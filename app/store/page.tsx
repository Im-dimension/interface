"use client";

import { Button } from "@/components/ui/button";

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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Merchandise Store</h1>
      <div className="space-y-4">
        {merchItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                Thumbnail
              </div>
            </div>

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{item.name}</h3>
              <p className="text-muted-foreground">{item.price}</p>
            </div>

            {/* Buy Button */}
            <Button
              onClick={() => handleBuy(item.name)}
              className="flex-shrink-0"
            >
              Buy
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
