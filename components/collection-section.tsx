interface CollectionSectionProps {
  title: string
}

export function CollectionSection({ title }: CollectionSectionProps) {
  return (
    <div className="bg-white py-8 md:py-12 px-6 md:px-8">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">{title}</h2>
    </div>
  )
}
