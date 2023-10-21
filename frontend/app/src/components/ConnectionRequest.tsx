import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useAccount, useWalletClient } from "wagmi";
import { Client, useClient } from "@xmtp/react-sdk";
import Dexie from "dexie";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { ethers } from "ethers";
import { Label } from "../../@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../@/components/ui/select";
import { clickHandler } from "./Search";
import { Input } from "../../@/components/ui/input";

type FormData = {
  message: string;
  type: string;
};
interface IConnectionRequest {
  formData: FormData;
  handleChange: () => void;
  clickHandler: () => void;
}
const ConnectionRequest: React.FC<IConnectionRequest> = ({
  formData,
  handleChange,
}) => {
  const { client } = useClient();

  //empty empty bookmark

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 w-fit mt-1 h-fit hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5">
          Connect
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send a connection request</DialogTitle>
          <DialogDescription>
            Write a message for your connection and select your connection
            reason.
          </DialogDescription>
        </DialogHeader>
        <div className="grid w-full items-center justify-center gap-4 py-4">
          <div className="flex  items-center gap-11">
            <Label htmlFor="username" className="text-right">
              Type
            </Label>
            <Select
              value={formData.type}
              name="type"
              onValueChange={handleChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Consulting_gig">Consulting gig</SelectItem>
                  <SelectItem value="Interview_request">
                    Interview request
                  </SelectItem>
                  <SelectItem value="Expert_Opinion">Expert Opinion</SelectItem>
                  <SelectItem value="Recruiting">Recruiting</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex  justify-center items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Message
            </Label>
            <Input
              value={formData.message}
              onChange={handleChange}
              required
              id="message"
              placeholder="Type your message here."
              className="col-span-3 
            "
            />
          </div>
        </div>
        <div className="flex w-full items-end justify-end">
          {/* <button
            onClick={clickHandler(user.address, walletClient, client)}
            className="px-4 w-fit mt-1 h-fit hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
          >
            Send a request
          </button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionRequest;
