import "./Menu.css";
import React, {FC, PropsWithChildren} from "react";
import {IconButton, Tooltip} from "@radix-ui/themes";
import {Link, Route, Routes} from "react-router-dom";
// Alt for messages:
import {AiOutlineMessage, AiOutlineSearch, AiOutlineUser, AiOutlineUsergroupAdd,} from "react-icons/ai";
import {FiSettings} from "react-icons/fi";
import {RiAdminLine, RiMessage2Line} from "react-icons/ri";


const MenuIcon: FC<PropsWithChildren<{ tooltip: string; link: string }>> = ({
                                                                                tooltip,
                                                                                link,
                                                                                children,
                                                                            }) => {
    return (
        <Tooltip
            content={tooltip}
            side={"bottom"}
            className={"bg-white text-gray-600"}
        >
            <Link className="menu-button" to={link}>
                <IconButton className="sidebar-buttons">
                    {children}
                </IconButton>
            </Link>
        </Tooltip>
    );
};
export const Menu = () => {
    return (
        <>
            <div className="font-bold text-center text-xl p-4">
                <Routes>
                    <Route path="/search" element={<div>Search</div>}/>
                    <Route path="/" element={<div>Messages</div>}/>
                    <Route path="/messages" element={<div>Messages</div>}/>
                    <Route path="/connections" element={<div>Connections</div>}/>
                    <Route path="/admin" element={<div>Admin</div>}/>
                    <Route path="/profile/:address" element={<div>Profile</div>}/>
                    <Route path="/settings" element={<div>Settings</div>}/>
                </Routes>
            </div>
            <div className="mt-auto flex justify-between pb-6 border-b-[3px] max-w-[400px] px-4">
                <MenuIcon tooltip={"Search"} link={"/search"}>
                    <AiOutlineSearch className={"menu-icon"}/>
                </MenuIcon>
                <MenuIcon tooltip={"Messages"} link={"/messages"}>
                    <RiMessage2Line className={"menu-icon"}/>
                </MenuIcon>
                <MenuIcon tooltip={"Connections"} link={"/connections"}>
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
