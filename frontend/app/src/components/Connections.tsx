import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useAccount, useWalletClient } from "wagmi";
import { Client, useClient } from "@xmtp/react-sdk";
import Dexie from 'dexie';
import { SupabaseContext } from "../contexts/SupabaseContext";
import { ethers } from "ethers";
import axios from 'axios';




let clientPreferedEngine="159.203.132.121:3005/api/"

function getLocalConversationState(){
  
}

async function syncConversationlist(list:any,supabase:any){
  //@ts-ignore
    list.forEach((c)=>{ syncConversation(c,supabase) })
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

function xmsgcontent(xmessage:any){
    if(xmessage && xmessage.content && typeof xmessage.content === "string" )
      return xmessage.content
    else if(xmessage && xmessage.content.content && typeof xmessage.content.content === "string" ) 
      return xmessage.content.content;
}

async function syncConversation(convo:any,supabase:any){
  //console.log("🚀 ~ file: App.tsx:53 ~ syncConversation ~ convo:", convo)
  

  let gitcoinScore=-1;
  if(convo &&convo.peerAddress ){
    let peerAddress=convo.peerAddress;
    //console.log("🚀 ~ file: App.tsx:62 ~ syncConversation ~ peerAddress:", peerAddress)
    let clientAddress=convo.client.address;
    let localc = getLocalConvoSync(peerAddress,clientAddress)
    let newc={}
    if( true ||  !localc){ // not found  create new 

      
      let mres = await convo.messages({limit:1,direction:1}); //getting first message
      console.log("🚀 ~ file: App.tsx:78 ~ syncConversation ~ mres:", mres)
      const firstmsg =   ( mres&&mres.length>0&&mres[0].content &&mres[0].content.content )? xmsgcontent(mres[0]) : "";
      const words =  firstmsg.split(" ");
      const firstword =   words.length>0 ? words[0] : "";
      const secondword =  words.length>1 ? words[1] : "";
      console.log("🚀 ~ file: App.tsx:59 ~ syncConversation ~ firstmsg:", firstmsg)

      let relevantword="";
      let lastMessage=" ";
      let lastMessageFirstWord="";
      if(mres&& mres.length>0){

      let lastres = await convo.messages({limit:1,direction:2});  // getting lat message 
      lastMessage=  ( lastres&&lastres.length>0&&lastres[0].content )? xmsgcontent(lastres[0]) : "";
      console.log( lastres);
      console.log( "type "+ typeof lastMessage + " strgf"+JSON.stringify(lastMessage) +" lastres[0].content "+(lastres[0]).content.content );
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

        const url=  "http://"+clientPreferedEngine+'dili/trustscore';
      //  console.log("🚀 ~ file: Connections.tsx:146 ~ syncConversation ~ url:", url)
        let scoreres = await axios({
            method: 'post',
            url: url,
            data: {
              ops: 'nothing',
              account: peerAddress
            }
          });
       // console.log("🚀 ~ file: Connections.tsx:152 ~ syncConversation ~ axios  scoreres:", scoreres)


          if(scoreres && scoreres!.data!.result_payload!.score){
              peerTrustScore=scoreres.data.result_payload.score;
              console.log("🚀 ~ file: Connections.tsx:160 ~ syncConversation ~ peerTrustScore:", peerTrustScore)
              
          }
        }
        catch(error){
            console.log("🚀 ~ file: App.tsx:128 ~ syncConversation ~  axios error:", error)

        }

        try{
          let res3  = await supabase.from('people_search').select('pk,trust_score,gitcoin_score').eq('pk',peerAddress).single();
          console.log("🚀 ~ file: Connections.tsx:173 ~ syncConversation ~ res3:", res3)
          
          if(res3  && res3!.data!.gitcoin_score){
            gitcoinScore=res3!.data!.gitcoin_score;

          }
        }catch(error){

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





const Connections = () => {



  const supabase = useContext(SupabaseContext);
  const { client } = useClient();
  console.log("useClient() xmptpppp: client?.address "+ client?.address)
  console.log("useClient() xmptpppp: client "+ client)

  const getMessages = async () => {

    const allconvo = await client!.conversations.list();
    console.log("🚀 ~ file: App.tsx:32 ~ getMessages ~ allconvo:", allconvo)

    if(allconvo && allconvo.length>1)
      await syncConversationlist(allconvo,supabase);
 
   
  };



  useEffect(() => {
    getMessages()
      }, [])




    const navigate = useNavigate();
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  
    useEffect(() => {

      /*
      const initializeXmtpClient = async () => {
        if (walletClient) {

          console.log(client)
          setXmtpClient(client!);
          const allConversations = await client!.conversations.list();
          console.log(allConversations);
          const db = new Dexie('MyDatabase');
          db.version(1).stores({
              conversations: '++id, client.address, createdAt, peerAddress, topic, context, conversationVersion'
          });
          db.open().then(() => {
            
            return Promise.all(allConversations.map(conversation => {
                
              //@ts-ignore
                return db.conversations
                    .where('topic')
                    .equals(conversation.topic)
                    .count()
                    .then((count: number) => {
                        
                        if (count === 0) {
                          //@ts-ignore
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
      */
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
