import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useAccount, useWalletClient } from "wagmi";
import { Client } from "@xmtp/react-sdk";
import Dexie from 'dexie';
const Connections = () => {
    const navigate = useNavigate();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  
    useEffect(() => {
      const initializeXmtpClient = async () => {
        if (walletClient) {
          const client = await Client.create(walletClient);
          console.log(client)
          setXmtpClient(client);
          const allConversations = await client.conversations.list();
          console.log(allConversations);
          const db = new Dexie('MyDatabase');
          db.version(1).stores({
              conversations: '++id, client.address, createdAt, peerAddress, topic, context, conversationVersion'
          });
          db.open().then(() => {
            
            return Promise.all(allConversations.map(conversation => {
                
                return db.conversations
                    .where('topic')
                    .equals(conversation.topic)
                    .count()
                    .then((count: number) => {
                        
                        if (count === 0) {
                            return db.conversations.add(conversation);
                        } else {
                            console.log(`Conversation with topic '${conversation.topic}' already exists. Skipping...`);
                            return null;
                        }
                    });
            }));
        }).then((results: any[]) => {
            
            const addedConversations = results.filter(result => result !== null);
            console.log(`Added ${addedConversations.length} new conversations to the database.`);
        }).catch((error: any) => {
            console.error('Error: ', error);
        });
        // for await (const conversation of stream) {
        //    console.log(`New conversation started with ${conversation.peerAddress}`);}
// for await (const conversation of stream) {
//   console.log(`New conversation started with ${conversation.peerAddress}`);
//   }  }

      }};
  
      initializeXmtpClient();
    }, [walletClient]);
  const connectionList = [
    {
      name: "John Doe",
      image: "",
    },
    {
      name: "John Doe",
      image: "",
    },
    {
      name: "John Doe",
      image: "",
    },
  ];
  return (
    <div className="w-[100%]">
      {" "}
      <div>
        <div
          className="flex text-[#73b6ff] text-[18px] mt-5 ml-5 font-semibold cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          <IoMdArrowBack className="mt-1" />
          <p>Back</p>
        </div>
        <div>
          <h2 className="text-center font-sans text-[24px] font-bold mb-4">Your Invitations</h2>

          <ul className="flex flex-row flex-wrap ">
            {connectionList.map((item,index) => {
              return (
                <li key={index} className="">
                
                  <div className="flex gap-16 mx-12 card-2">
                    <img
                      className="rounded-full h-[80px] w-[80px]"
                      src="https://avatars.githubusercontent.com/u/65860201?s=96&v=4"
                      alt="profile-image"
                    />
                    <div>
                      <div>
                        <p className=" font-sans mb-2">
                          <strong>{item.name}</strong> is intiving you to
                          connect
                        </p>
                        <button
                          className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-4 mb-4  text-center mr-2  h-[30px]"
                          type="submit"
                        >
                          Reject
                        </button>
                        <button
                          className="text-white mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-4 text-center mr-2  h-[30px]"
                          type="submit"
                        >
                          Accept
                        </button>
                      </div>
                      <div className="relative border-2 border-gray-400 rounded-md h-[60px]">
                        <p className="text-gray-600 ml-2 font-sans">
                          Looking forward to connect{" "}
                        </p>
                        <p className="absolute bottom-0 ml-2 text-gray-500 font-sans">
                          Accept to connect
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Connections;
