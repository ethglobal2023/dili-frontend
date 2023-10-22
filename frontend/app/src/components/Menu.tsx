import "./Menu.css";
import React, {
  FC,
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from "react";
import { IconButton } from "@radix-ui/themes";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../@/components/ui/tooltip";
import { Link, Route, Routes, useLocation } from "react-router-dom";
// Alt for messages:
import {
  AiOutlineMessage,
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { RiAdminLine, RiMessage2Line } from "react-icons/ri";
import { IoIosNotificationsOutline } from "react-icons/io";
import { getConReqListForUserApproval, syncConversation, syncConversationlist, syncConversationlist2 } from "./Connections";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useAccount, useWalletClient } from "wagmi";
import { Client, useClient } from "@xmtp/react-sdk";
import Dexie from "dexie";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { ethers } from "ethers";
import axios from "axios";
import { useWallet } from "../hooks/useWallet";
import useEthersWalletClient from "../hooks/useEthersWalletClient";
import { loadKeys, storeKeys } from "../utils/XMTPHelpers";

const MenuIcon: FC<PropsWithChildren<{ tooltip: string; link: string }>> = ({
  tooltip,
  link,
  children,
}) => {
  const location = useLocation();

  const isSelected =
    location.pathname === link || location.pathname.startsWith(link + "/");
  return (
    <TooltipProvider>
      <Tooltip delayDuration={10}>
        <TooltipTrigger asChild>
          <Link
            className={`menu-button ${
              isSelected
                ? "from-blue-500 via-blue-600  text-white  to-blue-700  bg-gradient-to-br"
                : "bg-white hover:text-white text-black"
            }`}
            to={link}
          >
            <IconButton className="sidebar-buttons">{children}</IconButton>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const Menu = () => {
  const [approveListCnt, setApproveListCnt] = useState(0);

  const { data: walletClient } = useWalletClient();
  const { client, initialize } = useClient();

  const supabase = useContext(SupabaseContext);

  const [address, setAddress] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  // const { data: walletClient } = useWalletClient();
  // const { data: walletClient } = useEthersWalletClient();
  const { isSignedIn } = useWallet();
  const { data: localWallet } = useEthersWalletClient();

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

  useEffect(() => {
    const requests = getConReqListForUserApproval();

    setApproveListCnt(requests.length);


    const timesteps=10010;
    const interval = setInterval(() => {


      const getMessages = async () => {


        if(client){
 
          console.log("CheckConvoEvery"+timesteps+"ms ~ setInterval()");
          await syncConversationlist2(client, supabase);
        }
      };
      getMessages();

    }, timesteps);








    if (client) {
      const xmtpLoop = async () => {
        const clientAddress = await localWallet.getAddress();
        setAddress(clientAddress);
        try {
          const stream = await client.conversations.stream();
          console.log("🚀 ~ file: Menu.tsx:134 ~ xmtpLoop ~ stream:", stream);
          console.log("🚀 ~ file: Menu.tsx:135 ~ xmtpLoop ~ client:", client);
          let last_reacted_convo = "";
          for await (const conversation of stream) {
            console.log(
              `New conversation started with ${conversation.peerAddress}`
            );
            // Say hello to your new friend

            // if (conversation.peerAddress === last_reacted_convo) break;

            last_reacted_convo = conversation.peerAddress;
            //@ts-ignore
            function sleep(ms) {
              return new Promise((resolve) => setTimeout(resolve, ms));
            }

            await sleep(20);
            let lol = await syncConversation(conversation, supabase, true);
            console.log(`syncConversation() returned `, lol);
            // Break from the loop to stop listening
            //This stream will continue infinitely. To end the stream,
            //You can either break from the loop, or call `await stream.return()`.

            break;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      xmtpLoop();
    }
  }, [client]);

  return (
    <>
      <div className="font-bold w-[400px] text-center text-xl p-4">
        <Routes>
          <Route path="/search" element={<div>Search</div>} />
          <Route path="/" element={<div>Messages</div>} />
          <Route path="/messages" element={<div>Messages</div>} />
          <Route path="/connections" element={<div>Connections</div>} />
          <Route path="/admin" element={<div>Admin</div>} />
          <Route path="/profile/:address" element={<div>Profile</div>} />
          <Route path="/profile/" element={<div>Profile</div>} />
          <Route path="/profile/self" element={<div>Profile</div>} />
          <Route path="/publish" element={<div>Profile</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Routes>
      </div>
      <div className="mt-auto flex justify-between pb-6 border-b-[3px] w-[400px] px-4">
        <MenuIcon tooltip={"Search"} link={"/search"}>
          <AiOutlineSearch className={"menu-icon"} />
        </MenuIcon>
        <MenuIcon tooltip={"Messages"} link={"/messages"}>
          <RiMessage2Line className={"menu-icon"} />
        </MenuIcon>

        <MenuIcon tooltip={"Connections"} link={"/connections"}>
          <AiOutlineUsergroupAdd className={"menu-icon"} />
        </MenuIcon>
        <MenuIcon tooltip={"My Profile"} link={`/profile/${address}`}>
          <AiOutlineUser className={"menu-icon"} />
        </MenuIcon>

        <MenuIcon tooltip={"Settings"} link={"/settings"}>
          <FiSettings className={"menu-icon"} />
        </MenuIcon>
      </div>
    </>
  );
};
