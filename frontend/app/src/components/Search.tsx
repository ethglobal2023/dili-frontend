import { FC, useContext, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../@/components/ui/avatar";
import { Card } from "../../@/components/ui/card";
import { Input } from "../../@/components/ui/input";
import "./Search.css";
import { useResumeCache } from "../contexts/FileCacheContext";
import { loadCidIntoCache } from "../cache";
import { Client, useClient } from "@xmtp/react-sdk";
import { ethers } from "ethers";
import axios from "axios";

import { useWallet } from "../hooks/useWallet";
import { useWalletClient } from "wagmi";
import useEthersWalletClient from "../hooks/useEthersWalletClient";

const getImageUrls = () => {
  const getImageURL = (gender: string, n: number) =>
    `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

  const getImageURLs = (gender: string) => {
    const imageURLs = [];
    for (let i = 1; i <= 100; i++) {
      imageURLs.push(getImageURL(gender, i));
    }
    return imageURLs;
  };

  const womenImageURLs = getImageURLs("women");
  const menImageURLs = getImageURLs("men");
  return [...womenImageURLs, ...menImageURLs];
};

type SearchForm = {
  searchTerm: string;
};

export const clickHandler = (to: string, walletClient: any, client: any) => {
  return (event: React.MouseEvent) => {
    constconnectReq(to, walletClient, client);
    event.preventDefault();
  };
};
let clientPreferedEngine = "localhost:3005/api/";

const constconnectReq = async (to: string, walletClient: any, client: any) => {
  const address = (await walletClient.getAddress()).toString();

  const message =
    "connection_request_from_" +
    address +
    "_to_" +
    to +
    "_______random_salt_" +
    Math.random() +
    " ";
  console.log("🚀 ~ file: Search.tsx:47 ~ constconnectReq ~ client:", client);

  if (!walletClient) throw new Error("Wallet client not initialized");

  if (!client) throw new Error("xmtp client missing");

  if (address !== client?.address)
    throw new Error(
      "xmtp client not equal to useWallet " + address + "!===" + client?.address
    );
  console.log(
    "🚀 ~ file: Search.tsx:81 ~ walletClient.signMessage() with address",
    address
  );

  const connection_message_hash = ethers
    .sha256(ethers.toUtf8Bytes(message))
    .toString();

  // const signature = await walletClient.signMessage({
  //     account: address,
  //     message: connection_message_hash,
  //   });
  const signature = await walletClient?.signMessage(connection_message_hash);

  const url =
    "http://" + clientPreferedEngine + "dili/announceconnectionrequest";

  //bookmark
  let scoreres = await axios({
    method: "post",
    url: url,
    data: {
      from: client?.address,
      request_hash: connection_message_hash,
      from_signature: signature,
    },
  });

  if (!client) {
    // TODO gotta push user to connect to xmtp first
  }
  let isOnNetwork = false;
  try {
    //@ts-ignore

    isOnNetwork = await client?.canMessage(to);
    console.log("🚀 ~ file: Search.tsx:51 ~ constconnectReq ~ to:", to);
    if (isOnNetwork) {
      const newConversation = await client?.conversations.newConversation(to);
      //@ts-ignore
      await newConversation.send(message);
      console.log("YAY sent connection request via message " + message);
    } else {
      console.error("Can't COnnect user is not on XMTP ");
    }
  } catch (error) {
    console.log("🚀 ~ file: Search.tsx:61 ~ constconnectReq ~ error:", error);
  }
};

export const Search: FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control,
  } = useForm<SearchForm>({});
  const supabase = useContext(SupabaseContext);
  const [error, setError] = useState("");
  const [data, setData] = useState<any[]>([]);
  const imageUrls = getImageUrls();
  const resumeCache = useResumeCache();
  const { client } = useClient();
  // const { address } = useWallet();

  // const { data: walletClient } = useWalletClient();
  const { data: walletClient } = useEthersWalletClient();
  console.log("useClient() xmptpppp: client?.address " + client?.address);

  //let clientPreferedEngine="159.203.132.121:3005/api/" //TODO change this to using standard settings

  // Load the cache with resumes after searching
  useEffect(() => {
    // Iterate over data and load the cache
    data.forEach(async (user) => {
      let cid = user.cid;
      if (!cid && !user.address) return; //Nothing to search for
      if (!cid && user.address) {
        try {
          const { data: resumeCid } = await supabase
            .from("resumes")
            .select("*")
            .eq("pk", user.address)
            .single();
          cid = resumeCid?.cid;
        } catch (e: any) {
          console.error("Error fetching resume CID: ", e.message);
          return;
        }
      }
      if (!cid) return; //Nothing to search for
      await loadCidIntoCache(cid, supabase, resumeCache);
    });
  }, [data]);

  const onSubmit: SubmitHandler<SearchForm> = async (data) => {
    const { searchTerm } = data;

    // const { data6, error6 } = await supabase.from('people_search').select("text").textSearch('text', `cat`)
    // const { data7, error7 } = await supabase.from('people_search').select("text").textSearch('text', `dog & cat`)
    // const { data8, error8 } = await supabase.from('people_search').select("text").textSearch('text', `'dog' & !'cat'`)
    const term = searchTerm
      .split(/[\s,]+/)
      .map((item) => item.trim())
      .join("&");
    console.log("Searching for: ", term);
    const { data: results, error } = await supabase
      .from("people_search")
      .select(
        `
                  pk,
                  json->"address",
                  json->"profileImage",
                  json->"preferredname",
                  json->"preferredtitle",
                  json->"preferredlocation",
                  json->"cid"`
      )
      .textSearch("text ", term)
      .eq("on_xmtp", "true")
      .order("trust_score", { ascending: false });

    //TODO Make this search more robust
    console.log("results: ", results);

    if (error) {
      setError(JSON.stringify(error));
      return;
    }

    setData(results);
  };

  return (
    <div className={"p-4 space-y-2"}>
      <form onSubmit={handleSubmit(onSubmit)} className={"p-4 rounded"}>
        <Input type="text" placeholder="Search" {...register("searchTerm")} />
      </form>
      {data.map((user) => {
        console.log(user);
        const randomIndex = Math.floor(Math.random() * imageUrls.length);
        const randomImage = imageUrls[randomIndex];
        return (
          <Card
            key={user.pk}
            className={`
            overflow-hidden
            ${"bg-white"}
            rounded
            w-96 
            shadow-lg 
            
            p-4  
            transition-transform 
            transform hover:scale-105`}
          >
            <div
              className={`flex 
              items-center 
              justify-between
              space-x-4`}
            >
              <Link
                className={`flex 
                  items-center 
                  space-x-4
                  w-2/3
                  ${"bg-white"}
                  `}
                to={`/profile/${user.pk}`}
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={user.profileImage || randomImage}
                    sizes={""}
                  />

                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-1/2">
                  <span className="text-xl tracking-tighter">
                    {user.preferredname || user.address || "Anonymous User"}
                  </span>{" "}
                  <span className="text-sm tracking-tight text-gray-500 truncate w-full">
                    {user.preferredtitle?.slice(0, 24)}
                  </span>
                </div>
              </Link>
              <div className="flex ">
                <button
                  onClick={clickHandler(user.address, walletClient, client)}
                  className="px-4 w-fit mt-1 h-fit hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
                >
                  Connect
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
