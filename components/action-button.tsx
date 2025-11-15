interface ActionButtonProps {
  label: string
  onClick?: () => void
}

export function ActionButton({ label, onClick }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="bg-[#f4d03f] hover:bg-[#e5c230] transition-colors rounded-full py-5 md:py-6 px-12 md:px-16 font-bold text-[#4a2a1f] text-xl md:text-2xl shadow-lg border-4 border-[#d4a520]/30 w-full sm:w-auto"
    >
      {label}
    </button>
  )
}
