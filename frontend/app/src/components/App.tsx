import "./App.css";
import React, { FC, PropsWithChildren, useCallback, useState,useContext } from "react";
import { type CachedConversation, useClient } from "@xmtp/react-sdk";
import {
  ArrowRightOnRectangleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { Conversations } from "./Conversations";
import { Messages } from "./Messages";
import { NewMessage } from "./NewMessage";
import { useWallet } from "../hooks/useWallet";
import { NoSelectedConversationNotification } from "./NoSelectedConversationNotification";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { IconButton, Tooltip } from "@radix-ui/themes";
import { Menu } from "./Menu";
import { RequireXMTPConnected } from "./RequireXMTPConnected";
import { Search } from "./Search";
import { EasConfigContextProvider } from "./admin/EASConfigContext";
import { AdminHome } from "./admin/AdminHome";
import ProfileCard from "./ProfileCard";
import { ProfilePublish } from "./ProfilePublish";
import {Resume} from "../types";
import {ResumeCache} from "../contexts/FileCacheContext";
import Connections from "./Connections";

import { SupabaseContext } from "../contexts/SupabaseContext";
import { ethers } from "ethers";
import axios from 'axios';


let clientPreferedEngine="localhost:3005:/api/"

function getLocalConversationState(){
  
}

function syncConversationlist(list:any){
  //@ts-ignore
    list.foreach((c)=>{ syncConversation(a) })
}

function getLocalConvoSync(peerAddress:string,clientAddress:string){
    const itemid="connection_req_state_peerAddress_"+peerAddress+"_clientAddress_"+clientAddress;
    let l = localStorage.getItem(itemid);
    if(l){
        try{
          return JSON.parse(l);
        }catch(error){
          console.error(" Could not parse localstorage item "+itemid+" error:"+error)
          return false;
        }
    }
    else{
      return false;
    }
}

//todo create an index of conversations that need to be approved 


function setLocalConvoSync(peerAddress:string,clientAddress:string,data:object){
  return ( localStorage.setItem("connection_req_state_peerAddress_"+peerAddress+"_clientAddress_"+clientAddress,JSON.stringify(data)) )
}

async function syncConversation(convo:any,supabase:any){
  console.log("🚀 ~ file: App.tsx:53 ~ syncConversation ~ convo:", convo)
  
  if(convo &&convo.peerAddress ){
    let peerAddress=convo.peerAddress;
    console.log("🚀 ~ file: App.tsx:62 ~ syncConversation ~ peerAddress:", peerAddress)
    let clientAddress=convo.client.address;
    let localc = getLocalConvoSync(peerAddress,clientAddress)
    let newc={}
    if( !localc){ // not found  create new 

      
      let mres = await convo.messages({limit:1,direction:1}); //getting first message
      const firstmsg =   ( mres&&mres.length>0 )? mres[0].content : "";
      const words =  firstmsg.split(" ");
      const firstword =   words.length>0 ? words[0] : "";
      const secondword =  words.length>1 ? words[1] : "";
      console.log("🚀 ~ file: App.tsx:59 ~ syncConversation ~ firstmsg:", firstmsg)

      let relevantword="";
      let lastMessage="";
      let lastMessageFirstWord="";
      if(mres&& mres.length>0){

      let lastres = await convo.messages({limit:1,direction:2});  // getting lat message 
      lastMessage=  ( lastres&&lastres.length>0 )? lastres[0].content : "";
      const lastMessageword = lastMessage.split(" ")
      lastMessageFirstWord=  ( lastMessageword.length>0)? lastMessageword[0] : "";

      }




      let today = new Date();
      let priorDate = new Date(new Date().setDate(today.getDate() - 30));


      //Only need to do this if the person is using the connection request mechanism. 
      let connectionRequests30days=-1;
      let requestAccouncedPublically=false;


      if( firstword.includes(clientAddress) ||  lastMessageFirstWord.includes(clientAddress)){

        
        if(firstword.includes(clientAddress) )
            relevantword=firstword;
        if(lastMessageFirstWord.includes(clientAddress))
            relevantword=lastMessageFirstWord;
        
        
        let connection_message_hash=""
        try{
          connection_message_hash= ethers.sha256(ethers.toUtf8Bytes(relevantword)).toString();
          console.log("🚀 ~ file: App.tsx:86 ~ syncConversation ~ connection_message_hash:", connection_message_hash)
          }
        catch(error){
          console.log("🚀 ~ file: App.tsx:97 ~ ethers.sha256(ethers.toUtf8Bytes(relevantword)).toString() ~ error:", error)
        }

        try{
          let res0  = await supabase.from('connection_requests').select('*').eq('from',peerAddress).eq('request_hash', connection_message_hash);
          if(res0){
            requestAccouncedPublically=true
          }

          let res1  = await supabase.from('connection_requests').select('*', { count: 'exact', head: true }).eq('from',peerAddress).gt('created_at', priorDate.toISOString());
          console.log( peerAddress+" requester had " +res1.count+ " announced requests last 30 days");
        
          
          if(res1&&res1?.count){
            connectionRequests30days=res1.count;
          }
          
        }
        catch(error){
          console.error("supabase failed ")
        }


      }

      let peerTrustScore=-1;
      try{
        let scoreres = await axios({
            method: 'post',
            url: clientPreferedEngine+'dili/trustscore',
            data: {
              ops: 'nothing',
              account: peerAddress
            }
          });
        }
        catch(error){
            console.log("🚀 ~ file: App.tsx:128 ~ syncConversation ~  axios error:", error)

        }

      


      newc={peerAddress:peerAddress,clientAddress:clientAddress,autoFilterState:"unknown",userResponse:"unkown",peerTrustScore:peerTrustScore,gitcoinScore:-1,createdAt:convo.createdAt ,firstmsg:firstmsg, lastmsg:lastMessage,relevantword:relevantword, firstword:firstword,secondword:secondword  ,connectionRequests30days:connectionRequests30days  , requestAccouncedPublically:requestAccouncedPublically, syncedAt:(new Date).toISOString()};
      console.log("🚀 ~ file: App.tsx:68 ~ syncConversation ~ newc:", newc)

      setLocalConvoSync(peerAddress,clientAddress,newc);

    }
  }
  else{
    console.log("syncConversation() This convo is not formated right ");
  }
}

export const App: React.FC = () => {


  const supabase = useContext(SupabaseContext);
  const { client } = useClient();
  console.log("useClient() xmptpppp: client?.address "+ client?.address)
  console.log("useClient() xmptpppp: client "+ client)

  const getMessages = async () => {

    const allconvo = await client!.conversations.list();
    console.log("🚀 ~ file: App.tsx:32 ~ getMessages ~ allconvo:", allconvo)

    if(allconvo && allconvo.length>1)
      await syncConversation(allconvo[0],supabase);
 
   
  };
  getMessages();


  const { disconnect } = useWallet();
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
    [],
  );

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

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
          <IconButton>{children}</IconButton>
        </Link>
      </Tooltip>
    );
  };
  return (
    <div className="  w-full h-[100vh] bg-[#f7f7f7] ">
      <div className="InboxConversations">
        <BrowserRouter>
          {/*<SideBar />*/}
          <div className="InboxConversations__list overflow-y-hidden border-r-[3px]">
            <Menu />
            <Routes>
              <Route
                path="/"
                element={<>
                  <div className="InboxHeader__actions">
                  <button
                   className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg flex dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
                    type="button"
                    onClick={handleStartNewConversation}
                  >
                      <div className="flex items-center justify-center space-x-1">
                          <PlusCircleIcon width={24} /> <span>New message</span>
                      </div>
                  </button>
                
                  </div>
                  <Conversations
                    onConversationClick={handleConversationClick}
                    selectedConversation={selectedConversation}
                  />
                  </>
                }
              />
              <Route path="/search" element={<Search/>} />
            </Routes>
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <RequireXMTPConnected>
                  <div className="InboxConversations__messages">
                    {isNewMessage ? (
                      <NewMessage onSuccess={handleStartNewConversationSuccess} />
                    ) : selectedConversation ? (
                      <Messages conversation={selectedConversation} />
                    ) : (
                      <NoSelectedConversationNotification
                        onStartNewConversation={handleStartNewConversation}
                      />
                    )}
                  </div>
                </RequireXMTPConnected>
              }
            />
            <Route
              path="/admin"
              element={
                <EasConfigContextProvider>
                  <AdminHome />
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
            <Route
              path="/profileEdit"
              element={<ProfilePublish/>}
            />
            <Route
              path="/profile/:cid"
              element={<ProfileCard />}
            />
            <Route path="/publish" element={<ProfilePublish />} />
          </Routes>
        </BrowserRouter>

      </div>
    </div>
  );
};
