"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationTabs() {
  const pathname = usePathname();
  const tabs = [
    { label: "WALLET", href: "/wallet" },
    { label: "STORE", href: "/store" },
    { label: "MTVRs", href: "/mtvrs" },
  ];

  return (
    <div className="flex items-start gap-2 mb-6 max-w-2xl mx-auto px-4 md:px-6">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 text-center rounded-b-xl px-3 sm:px-4 font-bold text-[#4a2a1f] shadow-lg hover:shadow-xl transition-all border-2 border-purple-600/20 text-sm sm:text-base md:text-lg ${
              isActive
                ? "bg-[#f4d03f] py-4 sm:py-5 md:py-6"
                : "bg-[#f3a8c7] py-3 sm:py-4"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
