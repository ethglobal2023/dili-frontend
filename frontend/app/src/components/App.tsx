import "./App.css";
import React, {FC, PropsWithChildren, useCallback, useState,} from "react";
import {type CachedConversation} from "@xmtp/react-sdk";
import {PlusCircleIcon,} from "@heroicons/react/24/outline";
import {Conversations} from "./Conversations";
import {Messages} from "./Messages";
import {NewMessage} from "./NewMessage";
import {useWallet} from "../hooks/useWallet";
import {NoSelectedConversationNotification} from "./NoSelectedConversationNotification";
import {Link, Route, Routes, useLocation,} from "react-router-dom";
import {IconButton, Tooltip} from "@radix-ui/themes";
import {Menu} from "./Menu";
import {RequireXMTPConnected} from "./RequireXMTPConnected";
import {Search} from "./Search";
import {EasConfigContextProvider} from "./admin/EASConfigContext";
import {AdminHome} from "./admin/AdminHome";
import ProfileCard from "./ProfileCard";
import {ProfilePublish} from "./ProfilePublish";
import Connections from "./Connections";
import {ProfileEdit} from "./ProfileEdit";
import {Settings} from "./Settings";

const MenuIcon: FC<PropsWithChildren<{ tooltip: string; link: string }>> = ({
                                                                                tooltip,
                                                                                link,
                                                                                children,
                                                                            }) => {
    return (
        <Tooltip
            content={tooltip}
            side={"top"}
            className={"bg-white text-gray-600"}
        >
            <Link to={link} className={"menu-link"}>
                <IconButton className="border">{children}</IconButton>
            </Link>
        </Tooltip>
    );
};

export const App: React.FC = () => {
    const {disconnect} = useWallet();
    const [selectedConversation, setSelectedConversation] = useState<
        CachedConversation | undefined
    >(undefined);
    const [isNewMessage, setIsNewMessage] = useState(false);

    const handleConversationClick = useCallback((convo: CachedConversation) => {
        setSelectedConversation(convo);
        setIsNewMessage(false);
    }, []);

    const handleStartNewConversation = useCallback(() => {
        setIsNewMessage(true);
    }, []);

    const handleStartNewConversationSuccess = useCallback(
        (convo?: CachedConversation) => {
            setSelectedConversation(convo);
            setIsNewMessage(false);
        },
        []
    );

    const handleDisconnect = useCallback(() => {
        disconnect();
    }, [disconnect]);

    const location = useLocation();
    console.log("🚀 ~ file: App.tsx:87 ~ location:", location);

    const isMessages =
        location.pathname === "/messages" || location.pathname === "/";
    return (
        <div className="  w-full  h-[85vh] bg-white  ">
            <div
                className={`InboxConversations ${isMessages && "overflow-y-hidden"}`}
            >
                {/* <BrowserRouter> */}
                {/*<SideBar />*/}
                <div className=" h-[100vh] overflow-x-hidden bg-white w-[400px]   border-r-[3px]">
                    <Menu/>
                    <Routes>
                        {["/", "/messages"].map((path, index) => {
                            return (
                                <Route
                                    path={path}
                                    element={
                                        <>
                                            <div className="flex w-full  items-center justify-center mb-3 mt-2">
                                                <button
                                                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg flex dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
                                                    type="button"
                                                    onClick={handleStartNewConversation}
                                                >
                                                    <div className="flex items-center justify-center  space-x-1">
                                                        <PlusCircleIcon width={24}/>{" "}
                                                        <span>New message</span>
                                                    </div>
                                                </button>
                                            </div>
                                            <Conversations
                                                onConversationClick={handleConversationClick}
                                                selectedConversation={selectedConversation}
                                            />
                                        </>
                                    }
                                    key={index}
                                />
                            );
                        })}
                        <Route path="/search" element={<Search/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                    </Routes>
                </div>
                <Routes>
                    {["/", "/messages"].map((path, index) => {
                        return (
                            <Route
                                path={path}
                                key={index}
                                element={
                                    <RequireXMTPConnected>
                                        <div className="InboxConversations__messages max-w-[1100px] mx-auto">
                                            {isNewMessage ? (
                                                <NewMessage
                                                    onSuccess={handleStartNewConversationSuccess}
                                                />
                                            ) : selectedConversation ? (
                                                <Messages conversation={selectedConversation}/>
                                            ) : (
                                                <NoSelectedConversationNotification
                                                    onStartNewConversation={handleStartNewConversation}
                                                />
                                            )}
                                        </div>
                                    </RequireXMTPConnected>
                                }
                            />
                        );
                    })}
                    <Route
                        path="/admin"
                        element={
                            <EasConfigContextProvider>
                                <AdminHome/>
                            </EasConfigContextProvider>
                        }
                    />
                    <Route
                        path="/connections"
                        element={
                            <RequireXMTPConnected>
                                <Connections/>
                            </RequireXMTPConnected>
                        }
                    />
                    <Route path="/profileEdit" element={<ProfileEdit/>}/>
                    <Route path="/profile/:cid" element={<ProfileCard/>}/>
                    <Route path="/publish" element={<ProfilePublish/>}/>
                </Routes>
                {/* </BrowserRouter> */}
            </div>
        </div>
    );
};
