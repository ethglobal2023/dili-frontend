import { LinkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useClient, Client } from "@xmtp/react-sdk";
import { useCallback, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Notification } from "./Notification";

const ENCODING = "binary";

export const getEnv = (): "dev" | "production" | "local" => {
  return "production";
};

export const buildLocalStorageKey = (walletAddress: string) =>
  walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress: string): Uint8Array | null => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : null;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};

type XMTPConnectButtonProps = {
  label: string;
};

const XMTPConnectButton: React.FC<XMTPConnectButtonProps> = ({ label }) => {
  const { initialize } = useClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  // const handleConnect = useCallback(() => {
  //   let keys = loadKeys(address!);
  //   if (!keys) {
  //     keys = await Client.getKeys(localWallet, {});

  //     storeKeys(localWallet.account.address!, keys!);
  //     await initialize({ signer: localWallet });
  //   void initialize({
  //     signer: walletClient,
  //   });
  // }}, [initialize, walletClient]);

  const handleConnect = async () => {
    let keys = loadKeys(address!);
    if (!keys) {
      keys = await Client.getKeys(walletClient!);

      storeKeys(address!, keys!);
    }
    await initialize({ keys, signer: walletClient });
  };

  useEffect(() => {
    if (address) {
      void handleConnect();
    }
  }, []);

  return (
    <button
      className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg flex dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
      type="button"
      onClick={handleConnect}
    >
      {label}
    </button>
  );
};

export const XMTPConnect: React.FC = () => {
  const { isLoading, error } = useClient();

  if (error) {
    return (
      <Notification
        icon={<ExclamationTriangleIcon />}
        title="Could not connect to XMTP"
        cta={<XMTPConnectButton label="Try again" />}
      >
        Something went wrong
      </Notification>
    );
  }

  if (isLoading) {
    return (
      <Notification icon={<LinkIcon />} title="Connecting to XMTP">
        Awaiting signatures...
      </Notification>
    );
  }

  return (
    <Notification
      icon={<LinkIcon />}
      title="XMTP not connected"
      cta={<XMTPConnectButton label="Connect" />}
    >
      Connect to XMTP to continue
    </Notification>
  );
};
