import React, { useState, useEffect, useRef } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { IoCopyOutline, IoLogOutOutline } from "react-icons/io5";
import { MdDone } from "react-icons/md";
import { useWallet } from "../hooks/useWallet";
import { useBalance } from "wagmi";
import { formatEther } from "ethers";
import { Address } from "viem";
//@ts-ignore
import Identicon from "react-identicons";
interface IEmbeddedWalletModal {
  logout: () => void;
  setIsWalletModal: (val: boolean) => void;
}

export const truncateAddress = (address: string) => {
  if (address && address.length <= 6) return address; // No need to truncate if the address is too short

  const prefix = address.slice(0, 4); // Typically "0x"
  const suffix = address.slice(-4); // The last 4 characters

  return `${prefix}...${suffix}`;
};

const EmbeddedWalletModal: React.FC<IEmbeddedWalletModal> = ({
  logout,
  setIsWalletModal,
}) => {
  const { account } = useWallet();
  const { data } = useBalance({
    address: account?.address,
  });
  console.log("🚀 ~ file: EmbeddedWalletModal.tsx:33 ~ data:", data);
  const ref = useRef<HTMLDivElement | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const truncatedAddress = truncateAddress(account?.address as string);
  const balance = formatEther(data?.value!);
  console.log("🚀 ~ file: EmbeddedWalletModal.tsx:38 ~ balance:", balance);
  //   const { address, isConnected, isConnecting, isReconnecting, connector } =
  //     useAccount();

  useEffect(() => {
    function handleEvent(event: MouseEvent) {
      const clickedElement = event.target as HTMLElement;
      const clickedElementId = clickedElement.id;
      console.log(
        "🚀 ~ file: LoginWithEmail.tsx:122 ~ handleEvent ~ clickedElementId:",
        clickedElementId
      );

      if (clickedElementId === "bg") {
        closeModal();
      }
    }

    document.addEventListener("mousedown", handleEvent);

    return () => {
      document.removeEventListener("mousedown", handleEvent);
    };
  }, [ref]);

  const closeModal = () => {
    setIsWalletModal(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(account?.address as string);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1200);
  };
  return (
    <div
      id="bg"
      ref={ref}
      className="fixed inset-0 flex  bg-opacity-40 items-center justify-center z-10 divide-y divide-gray-200 bg-[#b2b2b2]"
    >
      <div
        id="modal"
        className="relative bg-[#f4f4f4] rounded-xl shadow-2xl  drop-shadow-2xl w-96 border-2 h-56"
      >
        <AiOutlineClose
          className="absolute right-6 top-4 cursor-pointer"
          onClick={closeModal}
        />
        <div className="absolute top-12 flex gap-2 w-full flex-col justify-center items-center">
          <Identicon string={truncatedAddress} size={32} />
          <div className="flex-col justify-center text-center ">
            <h1 className="font-bold tracking-lighter text-[#25292e] text-[18px] ">
              {truncatedAddress}
            </h1>
            <h1 className="font-semibold text-[#868989] ">{balance} ETH</h1>
          </div>
        </div>
        <div className="absolute bottom-4 w-full flex gap-8 justify-center">
          <button
            onClick={copyAddress}
            className="flex flex-col bg-[#fafafa] w-2/5 hover:scale-105 transition duration-200 ease-in-out rounded-lg py-1 justify-center items-center"
          >
            {isCopied ? (
              <>
                <MdDone className=" cursor-pointer" size={24} />
                <span className="text-xs font-semibold">Copied</span>
              </>
            ) : (
              <>
                <IoCopyOutline className=" cursor-pointer" size={24} />
                <span className="text-xs font-semibold">Copy Address</span>
              </>
            )}
          </button>
          <button
            onClick={logout}
            className="flex flex-col bg-[#fafafa] w-2/5 hover:scale-105 transition duration-200 ease-in-out rounded-lg py-1 justify-center items-center"
          >
            <IoLogOutOutline className="cursor-pointer" size={24} />
            <span className="text-xs font-semibold">Disconnect</span>{" "}
          </button>
        </div>
      </div>
    </div>
  );
};
export default EmbeddedWalletModal;
