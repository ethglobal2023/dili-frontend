import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useClient } from "@xmtp/react-sdk";
import { useWallet } from "../hooks/useWallet";
import { WalletConnect } from "./WalletConnect";
import { XMTPConnect } from "./XMTPConnect";
import { Notification } from "./Notification";
import { LinkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { Wallet } from "ethers";
import { createWalletClient, custom, http } from "viem";
import { mainnet } from "viem/chains";
import LoginWithEmail from "./LoginWithEmail";
import Landing from "./Landing";
import { Link } from "react-router-dom";

export const RequireWalletConnected: FC<PropsWithChildren> = ({ children }) => {
  const { address, isConnected, chain, walletClient, isSignedIn } = useWallet();
  console.log("child", children);

  console.log(
    "🚀 ~ file: RequireWalletConnected.tsx:16 ~ isConnected:",
    isConnected,
    typeof walletClient?.account
  );

  console.log(
    "is tr",
    !isConnected || typeof walletClient?.account === "undefined"
  );

  // const client = createWalletClient({
  //   account: walletAddress as `0x${string}`,
  //   chain: mainnet,
  //   transport: http(),
  // });

  if (!isConnected && !isSignedIn) {
    return (

  <div className=" z-30 landing ">
  <div className=" hero relative md:w-11/12 mx-auto  h-screen flex flex-col items-center justify-center w-full">
    <div className="   -mt-24 relative h-full flex items-center justify-between  w-full font-bold tracking-wide">
      <div className=" w-full z-20 text-center ">

        <div className=" relative flex flex-col items-center justify-center max-w-7xl mx-auto">
          <div className=" font-extrabold mb-8 tracking-wide text-7xl text-[120px]">
       <span className=" bg-clip-text drop-shadow-lg text-gray-900 bg-top ">
              Decentralized{" "}
            </span>
           <span className=" bg-clip-text drop-shadow-lg text-gray-900 bg-bottom ">
              LinkedIn
            </span>
          </div>

        </div>
        <p className=" max-w-3xl text-xl tracking-wide font-semibold text-center mx-auto mt-5">
Xmtp,Lit Protocol, Embedded Wallets and much more
        </p>
        <button   className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-8 py-4 text-center mr-2 mt-6 ">Get Started
              {/* </span> */}
            </button>
      </div>

    </div>
  
  </div>

</div>
    );
  } else {
    return children;
  }
};
