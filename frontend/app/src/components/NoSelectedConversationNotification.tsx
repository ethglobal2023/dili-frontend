import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Notification } from "./Notification";

type NoSelectedConversationNotificationProps = {
  onStartNewConversation?: VoidFunction;
};

export const NoSelectedConversationNotification: React.FC<
  NoSelectedConversationNotificationProps
> = ({ onStartNewConversation }) => (
  <Notification
    cta={
      <button className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-lg px-6 py-2 text-center mr-2 mt-6 " type="button" onClick={onStartNewConversation}>
        Start new conversation
      </button>
    }
    icon={<ChatBubbleLeftRightIcon />}
    title="No conversation selected">
    Select a conversation to display its messages or start a new conversation
  </Notification>
);
