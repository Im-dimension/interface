"use client";

import { cn } from "@/app/utils/tw-utils";

interface ActionButtonProps {
  label: string
  onClick?: () => void
  bgImage?: string
  className?: string
}

export function Button({ label, onClick, className, bgImage }: ActionButtonProps) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn("bg-[#f4d03f] hover:bg-[#e5c230] transition-colors rounded-full py-2 md:py-4 px-6 font-bold text-[#4a2a1f] text-xl md:text-2xl shadow-lg border-4 border-[#d4a520]/30 w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#d4a520]/40", className, bgImage && `bg-cover bg-center bg-no-repeat`, bgImage && `bg-[url(${bgImage})]`)}
    >
      {label}
    </button>
  )
}
