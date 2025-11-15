interface InfoCardProps {
  title: string;
  description: string;
}

export function InfoCard({ title, description }: InfoCardProps) {
  return (
    <div className="flex-1 bg-[#f4d4a0] rounded-2xl p-6 md:p-8 border-4 border-dashed border-[#d4a520]/40 shadow-lg mx-auto">
      <h3 className="font-bold text-[#4a2a75] text-xl md:text-2xl mb-2">
        {title}
      </h3>
      <p className="text-[#4a2a75] text-sm md:text-base leading-relaxed font-semibold">
        {description}
      </p>
    </div>
  );
}
