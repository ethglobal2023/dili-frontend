import { useConversations, useStreamConversations } from "@xmtp/react-sdk";
import type { CachedConversation  } from "@xmtp/react-sdk";
import { Client, useClient } from "@xmtp/react-sdk";
import React, { useEffect, useState, useContext } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { ConversationList } from "@xmtp/react-components";
import { Notification } from "./Notification";
import { ConversationCard } from "./ConversationCard";
import { syncConversationlist } from "./Connections";
import { SupabaseContext } from "../contexts/SupabaseContext";
 
type ConversationsProps = {
  selectedConversation?: CachedConversation;
  onConversationClick?: (conversation: CachedConversation) => void;
};


export function getApprovedConList():string[] {
  //@ts-ignore
  let out = JSON.parse(localStorage.getItem("ApprovedConList")) || [""];
  console.log("🚀 ~ file: Conversations.tsx:17 ~ getApprovedConList ~ out:", out)
  return out;
}


const NoConversations: React.FC = () => (
  <Notification icon={<ChatBubbleLeftIcon />} title="No conversations found" >
    <div className="max-w-[350px]">It looks like you don&rsquo;t have any conversations yet. Create one to get
    started</div>
  </Notification>
);

export const Conversations: React.FC<ConversationsProps> = ({
  onConversationClick,
  selectedConversation,
}) => {
  const { conversations, isLoading } = useConversations();
  useStreamConversations();
  console.log("getApprovedConList():",getApprovedConList())
  console.log("conversationsconversations: ",conversations)


  const supabase = useContext(SupabaseContext);
  const { client } = useClient();
  console.log("useClient() xmptpppp: client?.address "+ client?.address)
  console.log("useClient() xmptpppp: client "+ client)

  const getMessages = async () => {

    const allconvo = await client!.conversations.list();
    if(allconvo && allconvo.length>0)
      await syncConversationlist(allconvo,supabase);
 
   
  };



  useEffect(() => {
    getMessages()
      }, [])


  const conversations_f=conversations.filter((x)=>getApprovedConList().includes(x.peerAddress.toUpperCase()))

  console.log("conversations_f:",conversations_f)
  const previews = conversations_f.map((conversation) => (
    <ConversationCard
      key={conversation.topic}
      conversation={conversation}
      isSelected={conversation.topic === selectedConversation?.topic}
      onConversationClick={onConversationClick}
    />
  ));

  return (
    <ConversationList
      isLoading={isLoading}
      conversations={previews}
      renderEmpty={<NoConversations />}
    />
  );
};
