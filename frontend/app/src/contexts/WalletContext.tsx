import "@rainbow-me/rainbowkit/styles.css";
import { createContext, useMemo, useState } from "react";
import {
  Chain,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork,
} from "wagmi";
import { createClient, http, publicActions } from "viem";
import { privateKeyToAccount, PrivateKeyAccount } from "viem/accounts";
import { mainnet } from "wagmi";

export type WalletContextValue = {
  address: `0x${string}` | undefined;
  disconnect: ReturnType<typeof useDisconnect>["disconnect"];
  error: Error | null;
  isConnected: boolean;
  isLoading: boolean;
  chain: Chain | undefined;
  chainsSupportedByWallet: Chain[];
  walletClient: any;
  setLocalAccount: (val: string) => void;
  isSignedIn: boolean;
  setIsSignedIn: (val: boolean) => void;
  account: PrivateKeyAccount | undefined;
};

export const WalletContext = createContext<WalletContextValue>({
  address: undefined,
  disconnect: () => {},
  error: null,
  isConnected: false,
  isLoading: false,
  chain: undefined,
  chainsSupportedByWallet: [],
  walletClient: null,
  setLocalAccount: () => {},
  isSignedIn: false,
  setIsSignedIn: () => {},
  account: undefined,
});

export const WalletProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [localAccount, setLocalAccount] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { address, isConnected, isConnecting, isReconnecting, connector } =
    useAccount();
  const { error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain, chains: chainsSupportedByWallet } = useNetwork();
  console.log("🚀 ~ file: WalletContext.tsx:48 ~ localAccount:", localAccount);

  const account =
    localAccount === ""
      ? undefined
      : privateKeyToAccount(localAccount as `0x${string}`);

  const walletClient = createClient({
    chain: mainnet,
    transport: http(),
    account,
  }).extend(publicActions);

  const isLoading = isConnecting || isReconnecting;

  // memo-ize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      address,
      disconnect,
      error,
      isLoading,
      isConnected,
      chain,
      chainsSupportedByWallet,
      walletClient,
      setLocalAccount,
      setIsSignedIn,
      isSignedIn,
      account,
    }),
    [
      address,
      disconnect,
      error,
      isLoading,
      isConnected,
      chain,
      chainsSupportedByWallet,
      localAccount,
      walletClient,
      isSignedIn,
      account,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
