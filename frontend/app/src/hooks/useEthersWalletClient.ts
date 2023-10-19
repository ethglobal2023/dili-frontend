import type { Address } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet } from "./useWallet";
import { Web3Provider } from "@ethersproject/providers";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const useEthersWalletClient = (): {
  data: {
    getAddress: () => Promise<Address>;
    signMessage: (message: string) => Promise<string>;
  };
  //   isLoading: boolean;
} => {
  const { data: walletClient, isLoading } = useWalletClient({ chainId: 1 });
  const { isSignedIn, account } = useWallet();
  console.log("🚀 ~ file: useEthersWalletClient.ts:17 ~ account:", account);
  //   const { connector } = useAccount();
  //   console.log("🚀 ~ file: useEthersWalletClient.ts:15 ~ connector:", connector);
  console.log(
    "🚀 ~ file: useEthersWalletClient.ts:14 ~ walletClient:",
    walletClient
  );

  //   const provider = connector?.getProvider().then((provider) => {
  //     return new Web3Provider(provider).getSigner();
  //   });
  //   console.log(
  //     "🚀 ~ file: useEthersWalletClient.ts:25 ~ provider ~ provider:",
  //     provider
  //   );

  const ethersWalletClient = {
    getAddress: async (): Promise<Address> => {
      return isSignedIn
        ? account?.address ?? ZERO_ADDRESS
        : walletClient?.account.address ?? ZERO_ADDRESS;
    },
    signMessage: async (message: string): Promise<string> => {
      const signature = isSignedIn
        ? await account?.signMessage({ message })
        : await walletClient?.signMessage({ message });
      return signature ?? "";
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signMessage, ...rest } = walletClient ?? {};

  const mergedWalletClient = {
    data: {
      ...ethersWalletClient,
      ...{ ...rest },
    },
  };

  return { data: mergedWalletClient.data };
};

export default useEthersWalletClient;
