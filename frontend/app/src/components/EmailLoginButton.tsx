import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useEffect, useContext } from "react";
// import {LoginWithEmail} from "./LoginWithEmail";
import { User } from "@supabase/supabase-js";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { decryptWithDeviceKey } from "../library/embedded_wallet";
import { useAccount, useWalletClient } from "wagmi";
import { useWallet } from "../hooks/useWallet";
import { wipeKeys } from "../utils/XMTPHelpers";
import EmbeddedWalletModal, { truncateAddress } from "./EmbeddedWalletModal";
//@ts-ignore
import Identicon from "react-identicons";

interface IEmailLoginButton {
  setIsOpen: (val: boolean) => void;
  setDeviceKey: (val: string) => void;
  user: User | null;
  setUser: (val: User | null) => void;
}
const EmailLoginButton: React.FC<IEmailLoginButton> = ({
  setIsOpen,
  setUser,
  setDeviceKey,
}) => {
  const supabase = useContext(SupabaseContext);
  const { address } = useAccount();
  const { walletClient, setLocalAccount, isSignedIn, setIsSignedIn, account } =
    useWallet();
  const [isWalletModal, setIsWalletModal] = useState(false);
  // const { data: walletClient } = useWalletClient();

  const truncatedAddress =
    account && truncateAddress(account?.address! as string);

  console.log("🚀 ~ file: Navbar.tsx:27 ~ walletClient:", walletClient!);
  //   console.log("🚀 ~ file: Navbar.tsx:26 ~ address:", address);
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("user nav", session);

      if (session) {
        console.log("navb", localStorage.getItem("deviceprivatekey"));
        const user = session.user;
        // const {
        //   data: { user },
        // } = await supabase.auth.getUser();
        const exampleData = decryptWithDeviceKey(
          localStorage.getItem("deviceprivatekey")!,
          user!.user_metadata.device_encrypted_private_key
        );
        setDeviceKey(localStorage.getItem("deviceprivatekey")!);
        console.log(
          "🚀 ~ file: LoginWithEmail.tsx:30 ~ login ~ exampleData:",
          exampleData
        );
        setLocalAccount(exampleData);
        setUser(user!);
        setIsSignedIn(true);
      } else {
        // alert("Error Accessing User");
      }
    });
  }, []);

  const logout = async () => {
    const data = await supabase.auth.signOut();
    console.log("🚀 ~ file: Navbar.tsx:37 ~ logout ~ data:", data);
    if (isSignedIn) {
      wipeKeys(account?.address!);
    } else {
      wipeKeys(address!);
    }
    setUser(null);
    setIsSignedIn(false);
    setIsWalletModal(false);
  };

  return (
    <>
      {isSignedIn ? (
        // <button
        //   className="px-4 hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
        //   onClick={() => setIsWalletModal(true)}
        // >
        //   Logout
        // </button>
        <button
          onClick={() => setIsWalletModal(true)}
          className="flex bg-white justify-center items-center  rounded-xl shadow-2xl  drop-shadow-2xl px-4 gap-2 hover:scale-105 transition duration-200 py-1.5"
        >
          <Identicon string={truncatedAddress} size={24} />
          <h1 className="font-semibold tracking-lighter text-[#25292e] text-base ">
            {truncatedAddress}
          </h1>
        </button>
      ) : (
        <button
          className="px-4 hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
          onClick={() => setIsOpen(true)}
        >
          Login with Email
        </button>
      )}
      {isWalletModal && (
        <EmbeddedWalletModal
          logout={logout}
          setIsWalletModal={setIsWalletModal}
        />
      )}
    </>
  );
};
export default EmailLoginButton;
