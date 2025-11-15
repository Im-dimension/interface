import { Menu, Search, User, ShoppingCart } from "lucide-react";

interface StoreHeaderProps {
  storeName: string;
}

export function StoreHeader({ storeName }: StoreHeaderProps) {
  return (
    <div className="absolute top-12 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-linear-to-b from-black/60 to-transparent">
      <Menu className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
      <Search className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
      <span className="font-bold text-white text-lg md:text-xl">
        {storeName}
      </span>
      <User className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
      <ShoppingCart className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
    </div>
  );
}
