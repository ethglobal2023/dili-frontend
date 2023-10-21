import "./Menu.css";
import React, {FC, PropsWithChildren, useContext, useEffect, useState} from "react";
import {IconButton} from "@radix-ui/themes";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,} from "../../@/components/ui/tooltip";
import {Link, Route, Routes} from "react-router-dom";
// Alt for messages:
import {AiOutlineSearch, AiOutlineUser, AiOutlineUsergroupAdd,} from "react-icons/ai";
import {FiSettings} from "react-icons/fi";
import {RiMessage2Line} from "react-icons/ri";
import {getConReqListForUserApproval, syncConversation} from "./Connections";
import "./App.css";
import {useWalletClient} from "wagmi";
import {useClient} from "@xmtp/react-sdk";
import {SupabaseContext} from "../contexts/SupabaseContext";


const MenuIcon: FC<
    PropsWithChildren<{ tooltip: string; link: string; additionalClass?: string }>
> = ({tooltip, link, children}) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={10}>
                <TooltipTrigger asChild>
                    <Link className="menu-button" to={link}>
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

    const {data: walletClient} = useWalletClient();
    const {client} = useClient();

    const supabase = useContext(SupabaseContext);
    useEffect(() => {
        const requests = getConReqListForUserApproval();
        console.log("🚀 ~ file: Menu.tsx:37 ~ useEffect ~ requests:", requests);
        setApproveListCnt(requests.length);
        const clientAddress = walletClient?.account?.address

        if (client) {


            const xmtpLoop = async () => {
                try {
                    const stream = await client.conversations.stream();
                    for await (const conversation of stream) {
                        console.log(`New conversation started with ${conversation.peerAddress}`);
                        // Say hello to your new friend

                        let lol = await syncConversation(conversation, supabase, true)
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
                    <Route path="/search" element={<div>Search</div>}/>
                    <Route path="/" element={<div>Messages</div>}/>
                    <Route path="/messages" element={<div>Messages</div>}/>
                    <Route path="/connections" element={<div>Connections</div>}/>
                    <Route path="/admin" element={<div>Admin</div>}/>
                    <Route path="/profile/:address" element={<div>Profile</div>}/>
                    <Route path="/publish" element={<div>Profile</div>}/>
                    <Route path="/settings" element={<div>Settings</div>}/>
                </Routes>
            </div>
            <div className="mt-auto flex justify-between pb-6 border-b-[3px] w-[400px] px-4">
                <MenuIcon tooltip={"Search"} link={"/search"}>
                    <AiOutlineSearch className={"menu-icon"}/>
                </MenuIcon>
                <MenuIcon tooltip={"Messages"} link={"/messages"}>
                    <RiMessage2Line className={"menu-icon"}/>
                </MenuIcon>

                <MenuIcon tooltip={"Connections"} link={"/connections"}>
                    {/* <IoIosNotificationsOutline
            className={
              "menu-icon absolute left-0 top-0 outline-red-500 outline-1 outline-dashed "
            }
          /> */}
                    {/* {approveListCnt && approveListCnt > 1 && (
            <div className="w-1.5 h-1.5 relative left-4  bottom-2 bg-red-800 rounded-full"></div>
          )} */}
                    <AiOutlineUsergroupAdd className={"menu-icon"}/>
                </MenuIcon>
                <MenuIcon tooltip={"My Profile"} link={"/profile/self"}>
                    <AiOutlineUser className={"menu-icon"}/>
                </MenuIcon>

                <MenuIcon tooltip={"Settings"} link={"/settings"}>
                    <FiSettings className={"menu-icon"}/>
                </MenuIcon>
            </div>
        </>
    );
};
