import Image from "next/image";

interface NFTCardProps {
  imageUrl: string;
  imageAlt: string;
}

export function NFTCard({ imageUrl, imageAlt }: NFTCardProps) {
  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl mx-auto ring-8 ring-purple-800/10">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] md:h-[60vh] lg:h-[70vh]">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={imageAlt}
          className="w-full h-full object-cover"
          width={1000}
          height={1000}
        />
      </div>
    </div>
  );
}
