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

 
interface IConReq {
    requester: string;
    recipient: string;
    message: string;
  }

const ConnectionRequest: React.FC<IConReq> = ({ requester, recipient, message }) => {

  const { client } = useClient();

//empty empty bookmark

  return(<div></div>);
};

export default ConnectionRequest;
