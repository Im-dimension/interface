import { useActiveAccount } from "thirdweb/react";
import { LoginView } from "@/components/login/login-view";

export const useWalletProvider = () => {
  const account = useActiveAccount();
  const isLoggedIn = !!account;

  return { isLoggedIn, account };
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useWalletProvider();

  if (!isLoggedIn) {
    return <LoginView />;
  }

  return <>{children}</>;
};
