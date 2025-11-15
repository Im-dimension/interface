interface WelcomeBannerProps {
  message: string;
}

export function WelcomeBanner({ message }: WelcomeBannerProps) {
  return (
    <div className="bg-[#ff69b4] py-3 px-6 text-center shadow-lg max-w-2xl mx-auto">
      <p className="font-bold text-[#f4d03f] text-base md:text-lg">{message}</p>
    </div>
  );
}
