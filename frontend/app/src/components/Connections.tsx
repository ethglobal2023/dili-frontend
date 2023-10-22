import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useAccount, useWalletClient } from "wagmi";
import { Client, useClient } from "@xmtp/react-sdk";
import Dexie from "dexie";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { ethers } from "ethers";
import axios from "axios";
import { Card } from "../../@/components/ui/card";

let clientPreferedEngine = "159.203.132.121:3005/api/"; //TODO change this to using standard settings

function getLocalConversationState() {}

function getListOfConnectionRequests() {}

export function getApprovedConList(): string[] {
  //@ts-ignore
  let out = JSON.parse(localStorage.getItem("ApprovedConList")) || [""];
  console.log("🚀 ~ file: Connections.tsx:28 ~ getApprovedConList ~ out:", out);
  return out;
}

export function getConReqListForUserApproval(): string[] {
  //@ts-ignore
  return JSON.parse(localStorage.getItem("ConReqListForUserApproval")) || [""];
}

function addConReqListForUserApproval(key: string) {
  let laststate = [];
  const b = localStorage.getItem("ConReqListForUserApproval");
  try {
    //@ts-ignore
    if (b && b!.length > 5) laststate = JSON.parse(b);
  } catch (error) {
    console.log(
      "🚀 ~ file: Connections.tsx:34 ~ addConReqListForUserApproval ~  JSON.parse(localStorage.getItem(ConReqListForUserApproval)) failed  error:",
      error
    );
  }
  laststate.push(key.toUpperCase());
  let out = [...new Set(laststate)];
  localStorage.setItem("ConReqListForUserApproval", JSON.stringify(out));
}

function addConReqToSpamList(key: string) {
  let laststate = [];
  const b = localStorage.getItem("ConReqSpamList");
  try {
    //@ts-ignore
    if (b && b!.length > 5) laststate = JSON.parse(b);
  } catch (error) {
    console.log(
      "🚀 ~ file:   JSON.parse(localStorage.getItem(ConReqSpamList)) failed  error:",
      error
    );
  }
  laststate.push(key.toUpperCase());
  let out = [...new Set(laststate)];
  localStorage.setItem("ConReqSpamList", JSON.stringify(out));
}

function getSpamList(): string[] {
  let laststate = [];
  const b = localStorage.getItem("ConReqSpamList");
  try {
    //@ts-ignore
    if (b && b!.length > 5) laststate = JSON.parse(b);
    return laststate;
  } catch (error) {
    console.log(
      "🚀 ~ file: getSpamList()  JSON.parse(localStorage.getItem(ConReqSpamList)) failed  error:",
      error
    );
  }
  return laststate;
}

function addConToApprovedList(key: string) {
  if (!isConnectionApproved(key.toUpperCase())) {
    let laststate = [];
    const b = localStorage.getItem("ApprovedConList");
    try {
      //@ts-ignore
      if (b && b!.length > 5) laststate = JSON.parse(b);
    } catch (error) {
      console.log(
        "🚀 ~   ~ addConToApprovedList ~  JSON.parse(localStorage.getItem(ApprovedConList)) failed  error:",
        error
      );
    }
    laststate.push(key.toUpperCase());
    localStorage.setItem("ApprovedConList", JSON.stringify(laststate));
  }
  //check if the key is in any other list and remove it if it is.

  removeKeyFromSpamList(key.toUpperCase());
  removeKeyFromWaitingList(key.toUpperCase());
}

function removeKeyFromWaitingList(key: string) {
  key = key.toUpperCase();
  let laststate = [];
  const b = localStorage.getItem("ConReqListForUserApproval");
  try {
    //@ts-ignore
    if (b && b!.length > 5) laststate = JSON.parse(b);
  } catch (error) {
    console.log("🚀 ~ file: removeKeyFromWaitingList()  error:", error);
  }
  //@ts-ignore
  laststate = laststate.filter(
    (item) => item.toUpperCase() !== key.toUpperCase()
  );
  let out = [...new Set(laststate)];
  localStorage.setItem("ConReqListForUserApproval", JSON.stringify(out));
}

function removeKeyFromSpamList(key: string) {
  key = key.toUpperCase();
  let laststate = [];
  const b = localStorage.getItem("ConReqSpamList");
  try {
    //@ts-ignore
    if (b && b!.length > 5) laststate = JSON.parse(b);
  } catch (error) {
    console.log("🚀 ~ file:  removeKeyFromSpamList() failed  error:", error);
  }
  //@ts-ignore
  laststate = laststate.filter(
    (item) => item.toUpperCase() !== key.toUpperCase()
  );
  let out = [...new Set(laststate)];
  localStorage.setItem("ConReqSpamList", JSON.stringify(out));
}

function isConnectionApproved(peerAddress: string) {
  let out = false;

  try {
    //@ts-ignore
    const a = JSON.parse(localStorage.getItem("ApprovedConList") || []);
    //@ts-ignore
    const f = a.filter((aa) => aa.includes(peerAddress));
    if (f && f.length > 0) return true;
  } catch (error) {
    console.log(
      "🚀 ~ file: Connections.tsx:64 ~ isConnectionApproved ~ error:",
      error
    );
  }

  return out;
}


function getLocalConvoSync(peerAddress: string, clientAddress: string) {
  const itemid =
    "connection_req_state_peerAddress_" +
    peerAddress +
    "_clientAddress_" +
    clientAddress;
  let l = localStorage.getItem(itemid);
  if (l) {
    try {
      return JSON.parse(l);
    } catch (error) {
      console.error(
        " Could not parse localstorage item " + itemid + " error:" + error
      );
      return false;
    }
  } else {
    return false;
  }
}

//todo create an index of conversations that need to be approved

function setLocalConvoSync(
  peerAddress: string,
  clientAddress: string,
  data: object
) {
  return localStorage.setItem(
    ("cr_" + peerAddress + "_clientAddress_" + clientAddress).toUpperCase(),
    JSON.stringify(data)
  );
}

function getConStatus(peerAddress: string, clientAddress: string) {
  try {
    //@ts-ignore
    return JSON.parse(  localStorage.getItem(   ("cr_" + peerAddress + "_clientAddress_" + clientAddress).toUpperCase()
      )
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: Connections.tsx:142 ~ getConStatus ~ error:",
      error
    );
  }
}

function xmsgcontent(xmessage: any) {
  if (xmessage && xmessage.content && typeof xmessage.content === "string")
    return xmessage.content;
  else if (
    xmessage &&
    xmessage.content.content &&
    typeof xmessage.content.content === "string"
  )
    return xmessage.content.content;
}



const mininterval=15000;
export async function syncConversationlist(list: any, supabase: any) {



  let lastTimesyncConversationlistRan;
  let tmp = localStorage.getItem("lastTimesyncConversationlistRan");
  if (!tmp)
    1===1;
  else{
    lastTimesyncConversationlistRan = new Date(tmp);
    let now = new Date();
    //@ts-ignore
    const diffInMs = now - lastTimesyncConversationlistRan ;
    if( diffInMs<mininterval ){
      console.log("🚀 ~ file: Connections.tsx:235 Too Fast not running   syncConversationlist again ~ diffInMs:", diffInMs)
      return;
    }
    else{
      console.log("🚀 ~ file: Connections.tsx:235  OK OK can run  syncConversationlist again ~ diffInMs:", diffInMs)
    }


  }


  //@ts-ignore
  list.forEach((c) => { syncConversation(c, supabase);

  localStorage.setItem("lastTimesyncConversationlistRan",(new Date()).toISOString());
  });
}


export async function syncConversationlist2(client: any, supabase: any) {



  let lastTimesyncConversationlistRan;
  let tmp = localStorage.getItem("lastTimesyncConversationlistRan");
  if (!tmp)
    1===1;
  else{
    lastTimesyncConversationlistRan = new Date(tmp);
    let now = new Date();
    //@ts-ignore
    const diffInMs = now - lastTimesyncConversationlistRan ;
    if( diffInMs<mininterval ){
      console.log("🚀 ~ file: Connections.tsx:235 Too Fast not running   syncConversationlist again ~ diffInMs:", diffInMs)
      return;
    }
    else{
      console.log("🚀 ~ file: Connections.tsx:235  OK OK can run  syncConversationlist again ~ diffInMs:", diffInMs)
    }


  }


  localStorage.setItem("lastTimesyncConversationlistRan",(new Date()).toISOString());
  const allconvo = await client!.conversations.list();

  console.log("🚀 ~ file: Connections.tsx:235  OK OK can run  syncConversationlist  allconvo.length"+allconvo.length)
  console.log("🚀 ~ file: Connections.tsx:235  OK OK can run  syncConversationlist  allconvo",allconvo)
  //@ts-ignore
  allconvo.forEach((c) => { syncConversation(c, supabase);

  });
}



let lastAutoReplyDest = "";
export async function syncConversation(
  convo: any,
  supabase: any,
  ignoreLocal = false
) {
  //console.log("🚀 ~ file: App.tsx:53 ~ syncConversation ~ convo:", convo)

  let tmp = localStorage.getItem("lastAutoReplyDest");
  if (!tmp) lastAutoReplyDest = "";
  else lastAutoReplyDest = tmp;




  let gitcoinScore = -1;
  if (convo && convo.peerAddress) {
    let peerAddress = convo.peerAddress;
    //console.log("🚀 ~ file: App.tsx:62 ~ syncConversation ~ peerAddress:", peerAddress)
    let clientAddress = convo.client.address.toUpperCase();
    console.log(
      "🚀 ~ file: Connections.tsx:152 ~ syncConversation ~ clientAddress:",
      clientAddress
    );
    let localc = getLocalConvoSync(peerAddress, clientAddress);
    let newc = {};
    let clientReplied = false;
    let anyClientRepliedEvenAuto = false;
    if (true || ignoreLocal || !localc) {
      //TODO remove true

      let m5res = await convo.messages({ limit: 5, direction: 2 });
      console.log("m5res=", m5res);
      //@ts-ignore
      clientReplied =
        m5res?.filter(
          (a) =>
            a.senderAddress.toUpperCase() === clientAddress &&
            !xmsgcontent(a).includes("auto reply")
        )?.length > 0
          ? true
          : false;

      //@ts-ignore
      anyClientRepliedEvenAuto =
        m5res?.filter((a) => a.senderAddress.toUpperCase() === clientAddress)
          ?.length > 0
          ? true
          : false;

      console.log(
        "🚀 ~ file: Connections.tsx:245 ~ syncConversation ~ clientReplied:",
        clientReplied
      );

      let mres = await convo.messages({ limit: 1, direction: 1 }); //getting first message
      console.log("🚀 ~ file: App.tsx:78 ~ syncConversation ~ mres:", mres);
      const firstmsg =
        mres && mres.length > 0 && mres[0].content && mres[0].content.content
          ? xmsgcontent(mres[0])
          : "";
      const words = firstmsg.split(" ");
      const firstword = firstmsg.split(" ")[0];
      const secondword = words.length > 1 ? words[1] : "";
      console.log(
        "🚀 ~ file: App.tsx:59 ~ syncConversation ~ firstmsg:",
        firstmsg
      );

      let relevantword = "";
      let lastMessage = " ";
      let lastMessageFirstWord = "";
      if (mres && mres.length > 0) {
        let lastres = await convo.messages({ limit: 1, direction: 2 }); // getting lat message
        lastMessage =
          lastres && lastres.length > 0 && lastres[0].content
            ? xmsgcontent(lastres[0])
            : "";
        console.log(lastres);
        console.log(
          "type " +
            typeof lastMessage +
            " strgf" +
            JSON.stringify(lastMessage) +
            " lastres[0].content " +
            xmsgcontent(lastres[0])
        );
        //const lastMessageword = lastMessage.split(" ")
        lastMessageFirstWord = lastMessage.split(" ")[0];
      }

      let today = new Date();
      let priorDate = new Date(new Date().setDate(today.getDate() - 30));

      //Only need to do this if the person is using the connection request mechanism.
      let connectionRequests30days = -1;
      let requestAccouncedPublically = false;

      console.log(
        "TEST   ~ firstword:" +
          firstword +
          "### ~ lastMessageFirstWord:" +
          lastMessageFirstWord +
          " clientAddress:" +
          clientAddress +
          "  peerAddress:" +
          peerAddress
      );
      if (
        firstword.toUpperCase().includes(clientAddress.toUpperCase()) ||
        lastMessageFirstWord.toUpperCase().includes(clientAddress.toUpperCase())
      ) {
        console.log(
          "TRUUUUE   ~ firstword:" +
            firstword +
            "### ~ lastMessageFirstWord:" +
            lastMessageFirstWord +
            " clientAddress:" +
            clientAddress +
            "  peerAddress:" +
            peerAddress
        );

        if (firstword.toUpperCase().includes(clientAddress.toUpperCase()))
          //this is too simple can be exploitet to invite multiple people in 1 request count
          relevantword = firstword;
        if (
          lastMessageFirstWord
            .toUpperCase()
            .includes(clientAddress.toUpperCase())
        )
          relevantword = lastMessageFirstWord;

        let connection_message_hash = "";
        try {
          connection_message_hash = ethers
            .sha256(ethers.toUtf8Bytes(relevantword))
            .toString();
          console.log(
            "🚀 ~ file: App.tsx:86 ~ syncConversation ~ connection_message_hash:",
            connection_message_hash
          );
        } catch (error) {
          console.log(
            "🚀 ~ file: App.tsx:97 ~ ethers.sha256(ethers.toUtf8Bytes(relevantword)).toString() ~ error:",
            error
          );
        }

        try {
          console.log(
            "🚀 ~ file: Connections.tsx:212 ~ syncConversation ~ connection_message_hash:" +
              connection_message_hash +
              "  peerAddress:" +
              peerAddress
          );
          let res0 = await supabase
            .from("connection_requests")
            .select("*")
            .eq("from", peerAddress)
            .eq("request_hash", connection_message_hash);
          if (res0) {
            requestAccouncedPublically = true;
          }

          let res1 = await supabase
            .from("connection_requests")
            .select("*", { count: "exact", head: true })
            .eq("from", peerAddress)
            .gt("created_at", priorDate.toISOString());
          console.log(
            peerAddress +
              " requester had " +
              res1.count +
              " announced requests last 30 days"
          );

          if (res1 && res1?.count) {
            connectionRequests30days = res1.count;
          }
        } catch (error) {
          console.error(
            "supabase failed on" +
              " connection_message_hash:" +
              connection_message_hash +
              "  peerAddress:" +
              peerAddress +
              " error:" +
              error
          );
        }
      }

      let peerTrustScore = -1;
      try {
        const url = "http://" + clientPreferedEngine + "dili/trustscore";
        //  console.log("🚀 ~ file: Connections.tsx:146 ~ syncConversation ~ url:", url)
        let scoreres = await axios({
          method: "post",
          url: url,
          data: {
            ops: "nothing",
            account: peerAddress,
          },
        });
        // console.log("🚀 ~ file: Connections.tsx:152 ~ syncConversation ~ axios  scoreres:", scoreres)

        if (scoreres && scoreres!.data!.result_payload!.score) {
          peerTrustScore = scoreres.data.result_payload.score;
          console.log(
            "🚀 ~ file: Connections.tsx:160 ~ syncConversation ~ peerTrustScore:",
            peerTrustScore
          );
        }
      } catch (error) {
        console.log(
          "🚀 ~ file: App.tsx:128 ~ syncConversation ~  axios error:",
          error
        );
      }

      try {
        let res3 = await supabase
          .from("people_search")
          .select("pk,trust_score,gitcoin_score")
          .eq("pk", peerAddress)
          .single();
        console.log(
          "🚀 ~ file: Connections.tsx:173 ~ syncConversation ~ res3:",
          res3
        );

        if (res3 && res3?.data?.gitcoin_score) {
          gitcoinScore = res3!.data!.gitcoin_score;
        }
      } catch (error) {
        console.log(
          "🚀 ~ file: Connections.tsx:180 ~ syncConversation ~ supabase people_search  error:",
          error
        );
      }

      newc = {
        peerAddress: peerAddress,
        clientAddress: clientAddress,
        autoFilterState: "unknown",
        userResponse: "unkown",
        peerTrustScore: peerTrustScore,
        gitcoinScore: -1,
        createdAt: convo.createdAt,
        firstmsg: firstmsg,
        lastmsg: lastMessage,
        relevantword: relevantword,
        firstword: firstword,
        secondword: secondword,
        lastMessageFirstWord: lastMessageFirstWord,
        connectionRequests30days: connectionRequests30days,
        requestAccouncedPublically: requestAccouncedPublically,
        syncedAt: new Date().toISOString(),
        autoReply: "",
      };
      console.log("🚀 ~ file: App.tsx:68 ~ syncConversation ~ newc:", newc);

      let autoReplyText="";
      //TODO change the below based on user settings
      if (clientReplied) {
        addConToApprovedList(peerAddress);
        const userResponse = "replied";
        //@ts-ignore
        newc.userResponse = userResponse;
        //@ts-ignore
        newc.autoFilterState = "ok-user-replied";
      } else if (!requestAccouncedPublically) {
        //@ts-ignore
        newc.autoFilterState = "spam";
        addConReqToSpamList(peerAddress);
        if (
          !anyClientRepliedEvenAuto &&
          lastAutoReplyDest.toUpperCase() !== peerAddress.toUpperCase()
        ) {
          lastAutoReplyDest = peerAddress;
          autoReplyText="I likley won't see this message because there was no public annonymized announcement of this connection request found. Most likely your using an XMTP client which has not implemented the DiLi decentralized spam protection standard. You could install DiLi or try to get incontact with me on another channel mentioning your xmtp address so I can whitelist you. ( auto reply )."
           
        }
      } else if (connectionRequests30days > 5) {
        //@ts-ignore
        newc.autoFilterState = "spam";
        addConReqToSpamList(peerAddress);
        if (
          !anyClientRepliedEvenAuto &&
          lastAutoReplyDest.toUpperCase() !== peerAddress.toUpperCase()
        ) {
          lastAutoReplyDest = peerAddress;
          autoReplyText= "This chat request has suprassed my confiugred max connection requests per month and will not show up on my device. Please try me again next month when your messaging volume is lower. ( auto reply )."
         
        }
      } else if (
        peerTrustScore < 5 &&
        requestAccouncedPublically &&
        connectionRequests30days < 100
      ) {
        addConReqListForUserApproval(peerAddress);
        //@ts-ignore
        newc.autoFilterState = "ok";
        if (
          !anyClientRepliedEvenAuto &&
          lastAutoReplyDest.toUpperCase() !== peerAddress.toUpperCase()
        ) {
          lastAutoReplyDest = peerAddress;
          autoReplyText= `Thanks for your connection request. Due to my current high workload it may take some time for me to get back to you. If you could first have a call with my account manager they could find a spot in my calendar and make sure I am the right fit for your project. Please get in contact here: https://calendly.com/copro-onboarding. Note: this was an auto reply.`
         
        }
      } else if (
        peerTrustScore > 25 &&
        requestAccouncedPublically &&
        connectionRequests30days < 100
      ) {
        addConToApprovedList(peerAddress);

        //@ts-ignore
        newc.autoFilterState = "ok";

        if (
          !anyClientRepliedEvenAuto &&
          lastAutoReplyDest.toUpperCase() !== peerAddress.toUpperCase()
        ) {
          lastAutoReplyDest = peerAddress;
          autoReplyText=`Thanks for your connection request. In case you would like to talk about a new consulting project feel free to directly book into my calender   https://calendly.com/wolffr . Note: this was an auto reply.`
         
        }

     
      } else {
        addConReqToSpamList(peerAddress);

        //@ts-ignore
        newc.autoFilterState = "spam";
        console.log(
          " EVAL EVAL EVAL " +
            peerAddress +
            " GOT REJECTED     .   data=" +
            JSON.stringify(newc)
        );
        //@ts-ignore
      }

      if(autoReplyText!==""){
        console.log("🚀 ~ file: Connections.tsx:624 ~ autoReplyText:", autoReplyText,peerAddress)


        //@ts-ignore
          let rememberWhoGotAutoReply =[];
          try{
            //@ts-ignore
           const tmpttt= JSON.parse(localStorage.getItem("rememberWhoGotAutoReply"));
           if(tmpttt)
            rememberWhoGotAutoReply=tmpttt

          }catch(error){
            1===1;
            rememberWhoGotAutoReply=[]
          }
          //@ts-ignore
          if(  !rememberWhoGotAutoReply.includes(peerAddress) ){
            await convo.send(autoReplyText);
            //@ts-ignore
            localStorage.setItem("rememberWhoGotAutoReply",[...rememberWhoGotAutoReply,peerAddress])
            console.log(" autoReplyText  sent and recorded in  rememberWhoGotAutoReply")

            //@ts-ignore
            newc['autoReply']=autoReplyText;
          }
        }

        console.log(
          " EVAL EVAL EVAL " +
            peerAddress +
            " IS OK         .     data=" +
            JSON.stringify(newc)
        );

      lastAutoReplyDest = peerAddress;
      localStorage.setItem("lastAutoReplyDest", lastAutoReplyDest);
      setLocalConvoSync(peerAddress, clientAddress, newc);
      return newc;
    }
  } else {
    console.log("syncConversation() This convo is not formated right ");
  }
}

const Connections = () => {
  function getConStatusMini(peerAddress: string) {
    try {
      //@ts-ignore

      console.log(
        "🚀 ~ file: Connections.tsx:399 ~ clientAddress ~ ",
        clientAddress
      );
      console.log(
        "🚀 ~ file: Connections.tsx:399 ~ getConStatusMini ~ clientAddress:",
        clientAddress
      );
      console.log(
        "🚀 ~ file: Connections.tsx:399 ~ getConStatusMini ~ " +
          (
            "cr_" +
            peerAddress +
            "_clientAddress_" +
            clientAddress
          ).toUpperCase()
      );

      //@ts-ignore
      return JSON.parse(
        localStorage.getItem(
          (
            "cr_" +
            peerAddress +
            "_clientAddress_" +
            clientAddress
          ).toUpperCase()
        )
      );
    } catch (error) {
      console.log(
        "🚀 ~ file: Connections.tsx:142 ~ getConStatus ~ error:",
        error
      );
    }
  }

  const [count, setCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const connectionForUserToApproveList = getConReqListForUserApproval();
  const connectionApprovedList = getApprovedConList();
  const connectionSpamList = getSpamList();
  console.log(
    "🚀 ~ file: Connections.tsx:312 ~ Connections ~ connectionForUserToApproveList:",
    connectionForUserToApproveList
  );

  const supabase = useContext(SupabaseContext);
  const { client } = useClient();
  console.log("useClient() xmptpppp: client?.address " + client?.address);
  console.log("useClient() xmptpppp: client " + client);

  const getMessages = async () => {
    const allconvo = await client!.conversations.list();
    console.log("🚀 ~ file: App.tsx:32 ~ getMessages ~ allconvo:", allconvo);

    if (allconvo && allconvo.length > 0)
      await syncConversationlist(allconvo, supabase);
  };

  const acceptClickHandler = (key: string) => {
    return (event: React.MouseEvent) => {
      addConToApprovedList(key.toUpperCase());
      setCount(1 + count);
      event.preventDefault();
    };
  };

  const rejectClickHandler = (key: string) => {
    return (event: React.MouseEvent) => {
      addConReqToSpamList(key.toUpperCase());
      setCount(1 + count);
      event.preventDefault();
    };
  };

  const simplergetConStatus = (key: string) => {
    let s = "";
    //@ts-ignore
    if (getConStatus(key, clientAddress)) {
      console.log(
        "🚀 ~ file: Connections.tsx:451 ~ simplergetConStatus ~ clientAddress:",
        clientAddress
      );
      //@ts-ignore
      s = getConStatus(key, clientAddress);

      //@ts-ignore
      return (
        " connectionRequests30days=" +
        s.connectionRequests30days +
        " requestAccouncedPublically=" +
        s.requestAccouncedPublically +
        " peerTrustScore=" +
        s.peerTrustScore +
        " gitcoinScore=" +
        s.gitcoinScore +
        " autoFilterState=" +
        s.autoFilterState
      );
    }
    return "";
  };

  useEffect(() => {
    getMessages();
  }, []);

  const navigate = useNavigate();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const clientAddress = walletClient?.account?.address;
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

  return (
    <div className="w-[1100px]">
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
          <h2 className="text-center font-sans text-[24px] font-bold mb-4">
            Your Invitations
          </h2>

          <ul className="flex flex-row justify-center items-center flex-wrap ">
            {connectionForUserToApproveList
              .filter((i) => i.length > 1)
              .map((item, index) => {
                //const itemstatus=getConStatus(item);
                return (
                  <Card
                    key={item}
                    className={`
            overflow-hidden
            ${"bg-white"}
            rounded-lg
            w-[600px] 
            shadow-lg 
            px-4 py-6  
            transition-transform 
            transform hover:shadow-xl`}
                  >
                    <div className="flex gap-16 mx-12 ">
                      <div>
                        <div className="r">
                          <p className=" font-sans mb-2">
                            <strong>{item}</strong> is intiving you to connect
                          </p>
                          <div className="w-full flex justify-center items-cente">
                            <button
                              onClick={rejectClickHandler(item)}
                              className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-4 mb-4  text-center mr-2  h-[30px]"
                              type="submit"
                            >
                              Reject
                            </button>
                            <button
                              onClick={acceptClickHandler(item)}
                              className="text-white mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-4 text-center mr-2  h-[30px]"
                              type="submit"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                        <div className="relative border-2 border-gray-400 rounded-md h-[60px]">
                          <p className="text-gray-600 ml-2 font-sans">
                            Looking forward to connect{" "}
                          </p>
                        </div>
                        <p className="text-gray-300 font-sans text-sm">
                          {simplergetConStatus(item)}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </ul>
        </div>

        <button
          className="text-white mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none  shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-4 text-center mx-4 cursor-pointer h-[30px]"
          onClick={() => setShowAll(!showAll)}
        >
          Show All ...
        </button>
        <div style={{ display: showAll ? "block" : "none" }}>
          <h2 className="text-center  text-xl font-bold mb-5">Spam Folder</h2>

          <ul className="grid grid-cols-2 w-full mx-10  gap-4  ">
            {connectionSpamList
              .filter((i) => i.length > 1)
              .map((item, index) => {
                //const itemstatus=getConStatus(item);
                return (
                  <Card
                    key={item}
                    className={`
            overflow-hidden
            ${"bg-white"}
            rounded-lg
            w-[500px] 
            shadow-lg 
             py-6  
            transition-transform 
            transform hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-center gap-16 mx-8 ">
                      <div>
                        <div>
                          <p className=" font-sans mb-2">
                            <strong className="text-red-500">{item}</strong>
                            's connection request
                          </p>{" "}
                          <div className="w-full flex items-center justify-center">
                            <button
                              onClick={acceptClickHandler(item)}
                              className="text-white mb-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-4 text-center mr-2  h-[30px]"
                              type="submit"
                            >
                              Accept
                            </button>
                          </div>
                        </div>

                        <div className="relative border-2 border-gray-400 rounded-md h-fit p-2">
                          <p className="text-gray-600 ml-2 font-sans">
                            {simplergetConStatus(item)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </ul>
        </div>

        <div style={{ display: showAll ? "block" : "none" }}>
          <h2 className="text-center  text-xl font-bold my-8">
            Accepted Connections
          </h2>

          <ul className="grid grid-cols-2 w-full mx-10  gap-4 ">
            {connectionApprovedList
              .filter((i) => i.length > 1)
              .map((item, index) => {
                //const itemstatus=getConStatus(item);
                return (
                  <Card
                    key={item}
                    className={`
            overflow-hidden
            ${"bg-white"}
            rounded-lg
            w-[500px] 
            shadow-lg 
             py-6  
            transition-transform 
            transform hover:shadow-xl`}
                  >
                    <div className="flex gap-16 mx-8 ">
                      <div>
                        <div>
                          <p className=" font-sans mb-2">
                            <strong className="text-green-500">{item}</strong>'s
                            connection request
                          </p>
                          <div className="w-full flex items-center justify-center">
                            <button
                              onClick={rejectClickHandler(item)}
                              className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 font-medium rounded-lg text-sm px-4 mb-4  text-center mr-2  h-[30px]"
                              type="submit"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                        <div className="relative border-2 border-gray-400 rounded-md h-fit">
                          <p className="text-gray-600 ml-2 font-sans">
                            {simplergetConStatus(item)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Connections;
