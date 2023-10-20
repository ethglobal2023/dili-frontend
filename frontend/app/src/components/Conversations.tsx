import { useConversations, useStreamConversations } from "@xmtp/react-sdk";
import type { CachedConversation } from "@xmtp/react-sdk";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { ConversationList } from "@xmtp/react-components";
import { Notification } from "./Notification";
import { ConversationCard } from "./ConversationCard";
 
type ConversationsProps = {
  selectedConversation?: CachedConversation;
  onConversationClick?: (conversation: CachedConversation) => void;
};


function getApprovedConList():string[] {
  //@ts-ignore
  return (JSON.parse(localStorage.getItem("ApprovedConList")) || [""]).map(a=>a.toLocaleUpperCase())
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
  const conversations_f=conversations.filter((x)=>getApprovedConList().includes(x.peerAddress.toLocaleUpperCase()))
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
