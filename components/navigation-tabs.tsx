interface NavigationTabsProps {
  tabs: Array<{ label: string; isActive?: boolean }>
}

export function NavigationTabs({ tabs }: NavigationTabsProps) {
  return (
    <div className="flex gap-3 mb-6 max-w-2xl mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`flex-1 rounded-xl py-4 px-4 font-bold text-[#4a2a1f] shadow-lg hover:shadow-xl transition-all border-2 border-purple-600/20 text-lg ${
            tab.isActive ? 'bg-[#f4d03f]' : 'bg-[#f3a8c7]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
