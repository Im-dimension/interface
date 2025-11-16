import Image from "next/image";

export function NFTCard({
  imageUrl,
  imageAlt,
}: {
  imageUrl: string;
  imageAlt: string;
}) {
  return (
    <Image
      src={imageUrl || "/placeholder.svg"}
      alt={imageAlt}
      className="w-full h-auto max-h-[70vh] object-cover rounded-2xl sm:rounded-3xl mx-auto"
      width={500}
      height={200}
      priority={false}
    />
  );
}
