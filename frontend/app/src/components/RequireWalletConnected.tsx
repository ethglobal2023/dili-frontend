import {FC, PropsWithChildren} from "react";
import {useWallet} from "../hooks/useWallet";
import Hero from "./Hero";

export const RequireWalletConnected: FC<PropsWithChildren> = ({children}) => {
    const {address, isConnected, chain, walletClient, isSignedIn} = useWallet();
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

    if (!isConnected && !isSignedIn) {
        return (<div className=" z-30 landing ">
            <div
                className=" hero relative md:w-11/12 mx-auto  h-screen flex flex-col items-center justify-center w-full">
                <div
                    className="   -mt-24 relative h-full flex items-center justify-between  w-full font-bold tracking-wide">
                    <div className=" w-full z-20 text-center ">

                        <Hero/>
                    </div>
                </div>
            </div>
        </div>)

    } else {
        return children;
    }
};
