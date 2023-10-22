import { LinkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Client, useClient } from "@xmtp/react-sdk";
import { useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Notification } from "./Notification";
import { useWallet } from "../hooks/useWallet";
import useEthersWalletClient from "../hooks/useEthersWalletClient";
import { loadKeys, storeKeys } from "../utils/XMTPHelpers";

type XMTPConnectButtonProps = {
  label: string;
};

const XMTPConnectButton: React.FC<XMTPConnectButtonProps> = ({ label }) => {
  const { initialize, client } = useClient();
  const { address } = useAccount();
  const { isSignedIn } = useWallet();
  const { data: walletClient } = useWalletClient();
  const { data: localWallet } = useEthersWalletClient();
  console.log("🚀 ~ file: XMTPConnect.tsx:38 ~ walletClient:", walletClient);
  console.log("🚀 ~ file: XMTPConnect.tsx:39 ~ localwallet:", localWallet);

  const handleConnect = async () => {
    if (isSignedIn) {
      const localAddress = await localWallet.getAddress();
      console.log(
        "🚀 ~ file: XMTPConnect.tsx:46 ~ handleConnect ~ address:",
        localAddress
      );
      let keys = loadKeys(localAddress!);
      console.log(
        "🚀 ~ file: XMTPConnect.tsx:51 ~ handleConnect ~ keys:",
        keys
      );
      if (!keys) {
        keys = await Client.getKeys(localWallet);

        storeKeys(address!, keys!);
      }
      await initialize({ signer: localWallet });
    } else {
      let keys = loadKeys(address!);
      if (!keys) {
        keys = await Client.getKeys(walletClient!);

        storeKeys(address!, keys!);
      }
      await initialize({ keys, signer: walletClient });
    }
  };

  useEffect(() => {
    if (address || isSignedIn) {
      void handleConnect();
    }
  }, []);

  return (
    <button className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-6 py-2 text-center mr-2 mt-6 " type="button" onClick={handleConnect}>
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
