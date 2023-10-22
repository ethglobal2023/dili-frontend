import React, { useContext, useEffect, useState } from "react";
import FileUploadModal from "./FileUpload";
import { Card } from "../../@/components/ui/card";
//@ts-ignore
import Identicon from "react-identicons";
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
  SelectTrigger,
  SelectValue,
} from "../../@/components/ui/select";
import { Label } from "../../@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../@/components/ui/tooltip";
import "./ProfileCard.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IndexedUser, Resume, Scores } from "../types";
import { ipfsDownload } from "../ipfs";
import { IoMdArrowBack } from "react-icons/io";
import { CiLocationOn } from "react-icons/ci";
import "./App.css";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { useResumeCache } from "../contexts/FileCacheContext";
import { useClient } from "@xmtp/react-sdk";
import { Input } from "../../@/components/ui/input";
import axios from "axios";
import SocialBadge from "./SocialBadge";
import Avatar, { genConfig } from "react-nice-avatar";
import useEthersWalletClient from "../hooks/useEthersWalletClient";
import { clickHandler } from "./Search";
import SkeletonCard from "./SkeletonCard";
import { VerifyModal } from "./VerifyModal";

export default function ProfileCard() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState({});
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  // const { address: walletAddress } = useWallet();
  const { data: walletClient } = useEthersWalletClient();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);

  const [scores, setScores] = useState<Scores>();
  const supabase = useContext(SupabaseContext);
  const { client } = useClient();
  const [formData, setFormData] = useState({
    type: "",
    message: "",
  });
  console.log("🚀 ~ file: ProfileCard.tsx:48 ~ ProfileCard ~ client:", client);

  const resumeCache = useResumeCache();

  const getImage = (event: any) => {
    setCurrentImage(event.target.files[0]);
  };

  //@Sakshi, this is the logic for fetching the resume from IPFS
  const [error, setError] = useState("");
  const [fetchedProfile, setFetchedProfile] = useState<Resume>();
  const [indexedUser, setIndexedUser] = useState<IndexedUser[]>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`https://api.web3.bio/profile/${cid}`);
        const user = response.data;
        console.log("user", user);
        setIndexedUser(user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const walletAddress = await walletClient?.getAddress();
      setAddress(walletAddress);
      console.log(
        "🚀 ~ file: ProfileCard.tsx:60 ~ fetchProfile ~ walletAddress:",
        walletAddress
      );
      try {
        setLoading(true);
        let stageCid = cid;

        if (!stageCid) {
          console.log("No cid provided");
          setLoading(false);
          return;
        }
        // if (stageCid === "self") {
        //   console.log(
        //     "No cid provided, but self, searching supabase for wallet address",
        //     walletAddress?.toLowerCase()
        //   );
        //   if (!walletAddress) {
        //     console.log("No wallet, nor cid provided to profile card");
        //     setLoading(false);
        //     return;
        //   }
        //   const { data } = await supabase
        //     .from("resumes")
        //     .select("cid")
        //     .eq("address", walletAddress.toLowerCase())
        //     .single();
        //   console.log(
        //     "🚀 ~ file: ProfileCard.tsx:65 ~ fetchProfile ~ data:",
        //     data
        //   );
        //   console.log(
        //     "🚀 ~ file: ProfileCard.tsx:83 ~ fetchProfile ~ data:",
        //     data
        //   );
        //   if (!data?.cid) throw new Error("No CID found for this address");
        //   console.log("CID:", data.cid);
        //   stageCid = data.cid;
        // }

        console.log("cid!.toLowerCase()", cid!.toLowerCase());

        const { data } = await supabase
          .from("resumes")
          .select("cid")
          .eq("address", cid!.toLowerCase())
          .single();
        console.log(
          "🚀 ~ file: ProfileCard.tsx:97 ~ fetchProfile ~ data:",
          data
        );
        console.log("Fetching resume from IPFS");
        stageCid = data?.cid!;
        console.log(
          "🚀 ~ file: ProfileCard.tsx:112 ~ fetchProfile ~ stageCid:",
          stageCid
        );
        const { data: scoreData } = await supabase
          .from("people_search")
          .select("trust_score,gitcoin_score")
          .eq("pk", cid!.toLowerCase())
          .single();
        console.log(
          "🚀 ~ file: ProfileCard.tsx:135 ~ fetchProfile ~ scoreData:",
          scoreData
        );
        //@ts-ignore
        setScores(scoreData!);
        const cacheEntry = resumeCache.get(stageCid);
        if (cacheEntry) {
          setFetchedProfile(cacheEntry);
          setLoading(false);
          return;
        }

        const resume = await ipfsDownload(stageCid || "");
        console.log("Fetched resume from IPFS: ", resume);
        resumeCache.set(stageCid, {
          ...resume,
          expiry: Date.now() + 1000 * 60 * 5,
        });

        // setScores(scoreData.)
        setLoading(false);
        setFetchedProfile(resume);
      } catch (error: any) {
        console.log(error);
        if (error.message === "No CID found for this address") {
          setLoading(false);
          navigate("/publish");
        }
      }
    };
    fetchProfile();
  }, []);
  console.log("Profile: ", fetchedProfile);

  // let educationOrganization: any = [];
  // let workOrganization: any = [];
  // if (fetchedProfile?.organization) {
  //   educationOrganization = fetchedProfile?.organization?.filter(
  //     (organization) => organization.type === "education"
  //   );
  //   console.log(educationOrganization);
  //   workOrganization = fetchedProfile?.organization.filter(
  //     (organization) => organization.type === "work"
  //   );
  //   console.log(workOrganization);
  // }

  const uploadImage = () => {};

  function formatUnixTimestamp(unixTimestamp: any) {
    const date = new Date(unixTimestamp * 1000);
    const day = date.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    return (
      date.toLocaleString("en-us", { month: "short" }) +
      ` ${day}${suffix}, ${date.getFullYear()}`
    );
  }

  let config;
  if (fetchedProfile) {
    config = genConfig(fetchedProfile?.firstName + fetchedProfile?.lastName);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    if (typeof e === "string") {
      setFormData({
        ...formData,
        type: e,
      });
    } else {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        message: value,
      });
    }
  };

  return (
    <>
      {loading ? (
        <SkeletonCard />
      ) : (
        <div className="flex relative justify-center bg-white w-[1100px]">
          <div
            className="flex absolute -left-0 text-[#73b6ff] text-[18px] mt-5 ml-5 font-semibold cursor-pointer"
            onClick={() => {
              navigate("/");
            }}
          >
            <IoMdArrowBack className="mt-1" />
            <p>Back</p>
          </div>
          <div className=" flex flex-col w-[60%] gap-[32px]">
            <FileUploadModal
              getImage={getImage}
              uploadImage={uploadImage}
              modalOpen={modalOpen}
              setModalOpen={setModalOpen}
              currentImage={currentImage}
              progress={progress}
            />
            {/* <div className=" ml-10"> */}
            <div className=" flex items-center justify-center text-gray-800 font-montserrat h-fit  w-[700px]  lg:p-10 p-6  rounded-xl ">
              <Card
                className={`
            overflow-hidden
            ${"bg-white"}
            rounded-lg
            w-[650px]
            shadow-lg 
            p-4  
            `}
              >
                <div className=" w-full  p-6 ">
                  <div className="flex flex-col items-center">
                    <div className=" flex flex-col items-center justify-between">
                      <div className="flex flex-col items-center justify-start pb-8">
                        <div>
                          {indexedUser &&
                          indexedUser.find((item) => item.avatar !== null) ? (
                            <img
                              className="w-32 h-32 rounded-full"
                              src={
                                indexedUser.find(
                                  (item) => item.avatar !== undefined
                                )!.avatar
                              }
                            />
                          ) : fetchedProfile?.profileImage ? (
                            <img
                              src={
                                fetchedProfile?.profileImage &&
                                fetchedProfile?.profileImage!
                              }
                              className="w-32 h-32 rounded-2xl"
                            />
                          ) : (
                            <Avatar
                              style={{ width: "8rem", height: "8rem" }}
                              className="rounded-full"
                              {...config}
                            />
                            // <Identicon string={address} size={24} />
                          )}
                        </div>
                        <div className="flex flex-col text-center gap-1">
                          <h3 className=" text-[18px] font-sans font-bold tracking-tighter text-gray-600 mt-2">
                            {indexedUser &&
                            indexedUser[0].error! !== "Not Found"
                              ? `${indexedUser[0].displayName}`
                              : `${fetchedProfile?.firstName} ${fetchedProfile?.lastName}`}
                          </h3>
                          <h2 className="tracking-tighter">
                            {fetchedProfile?.preferredTitle!}
                          </h2>
                          <div className="flex gap-1 items-center justify-center">
                            {fetchedProfile?.preferredLocation && (
                              <CiLocationOn size={16} />
                            )}

                            <p className=" text-[16px] tracking-tighter font-sans  text-gray-500 ">
                              {fetchedProfile?.preferredLocation}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-10 -mt-3 mb-4 items-center justify-center">
                        {scores?.gitcoin_score && scores?.trust_score && (
                          <div className="flex h-fit gap-4  ">
                            <TooltipProvider>
                              <Tooltip delayDuration={10}>
                                <TooltipTrigger asChild>
                                  <div className="text-[16px] px-4 py-2 rounded-xl text-lg shadow-xl drop-shadow-md bg-white  font-sans font-medium text-gray-500 tracking-tighter ">
                                    {" "}
                                    {scores?.trust_score}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Trust Score</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip delayDuration={10}>
                                <TooltipTrigger asChild>
                                  <div className="text-[16px] px-4 py-2 rounded-xl text-lg shadow-xl drop-shadow-md bg-white  font-sans font-medium text-gray-500 tracking-tighter ">
                                    {" "}
                                    {scores?.gitcoin_score}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Gitcoin Score</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                        {address.toLowerCase() === cid?.toLowerCase() ? (
                          <div className="w-full flex justify-end ">
                            <Link
                              to="/profileEdit"
                              state={{ profileData: fetchedProfile }}
                            >
                              <button
                                className="text-white  bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm mt-1 px-4 py-2 text-center"
                                type="button"
                                onClick={() => {
                                  navigate("/profileEdit");
                                }}
                              >
                                Edit profile
                              </button>
                            </Link>
                          </div>
                        ) : (
                          // <button
                          //   onClick={clickHandler(
                          //     address,
                          //     walletClient,
                          //     client
                          //   )}
                          //   className="px-4  mt-1 h-fit hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
                          // >
                          //   Connect
                          // </button>
                          <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                              <button className="text-white  bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm mt-1 px-4 py-2 text-center">
                                Connect
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>
                                  Send a connection request
                                </DialogTitle>
                                <DialogDescription>
                                  Write a message for your connection and select
                                  your connection reason.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid w-full items-center justify-center gap-4 py-4">
                                <div className="flex  items-center gap-11">
                                  <Label
                                    htmlFor="username"
                                    className="text-right"
                                  >
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
                                        <SelectItem value="Consulting_gig">
                                          Consulting gig
                                        </SelectItem>
                                        <SelectItem value="Interview_request">
                                          Interview request
                                        </SelectItem>
                                        <SelectItem value="Expert_Opinion">
                                          Expert Opinion
                                        </SelectItem>
                                        <SelectItem value="Recruiting">
                                          Recruiting
                                        </SelectItem>
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex  justify-center items-center gap-4">
                                  <Label
                                    htmlFor="username"
                                    className="text-right"
                                  >
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
                                <button
                                  onClick={async () => {
                                    await clickHandler(
                                      address,
                                      walletClient,
                                      client,
                                      formData
                                    );
                                    setOpen(false);

                                    setFormData({ message: "", type: "" });
                                  }}
                                  className="px-4 w-fit mt-1 h-fit hover:scale-105 transition duration-200 text-lg rounded-xl font-semibold tracking-tighter bg-[#0e76fd] text-white py-1.5"
                                >
                                  Send a request
                                </button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    <div className="w-full flex justify-between ">
                      {" "}
                      <div className="w-full flex items-center text-center justify-center flex-col">
                        {" "}
                        <p className=" text-[16px] leading-normal font-sans font-medium text-gray-500">
                          {fetchedProfile?.description ||
                            indexedUser?.find((data) => data.description)
                              ?.description ||
                            "No description available"}
                        </p>
                        <div className=" flex flex-wrap items-center justify-center tracking-tight mt-2 gap-1.5 text-[16px] font-sans  text-gray-500 ">
                          {/* <span className="font-bold">Skills</span>:&nbsp; */}
                          {fetchedProfile?.skillKeywords
                            .split(",")
                            .map((keyword, index) => (
                              <span
                                key={index}
                                className="bg-blue-100  text-xs  font-medium mr-2 px-2.5 py-0.5 rounded  text-slate-400"
                              >
                                {keyword}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {indexedUser && indexedUser[0].error! !== "Not Found" && (
              <div className="flex text-center  justify-around text-gray-800 font-montserrat h-fit w-[700px] lg:p-10 p-6  card rounded-xl">
                {indexedUser!.map((data) => {
                  const platform = data.platform.toLocaleLowerCase();
                  const links = data.links;

                  let link = null;
                  let description = null;

                  // Iterate through the properties of the 'links' object
                  for (const key in links) {
                    if (
                      links.hasOwnProperty(key) &&
                      key.toLocaleLowerCase() === platform
                    ) {
                      link = links[key];
                      break;
                    }
                  }

                  // If no matching link was found, use the first link available
                  if (!link) {
                    for (const key in links) {
                      if (links.hasOwnProperty(key)) {
                        link = links[key];
                        break;
                      }
                    }
                  }

                  // If no matching link was found, use the first link available

                  return (
                    <SocialBadge
                      key={platform}
                      icon={platform}
                      link={link ? link.link : ""}
                      handle={data.identity}
                    />
                  );
                })}
              </div>
            )}

            {/* <div className="text-gray-800 font-montserrat h-fit mt-12 w-[700px] lg:p-10 p-6  card rounded-xl">
              {fetchedProfile?.organization &&
                fetchedProfile?.organization?.length > 0 && (
                  <div>
                    <h1 className="heading-2">Organizations</h1>
                    <ul>
                      {fetchedProfile?.organization?.map(
                        (item: any, index: any) => (
                          <li key={index} className="experience-card">
                            <div>
                              <br />
                              <img
                                className="experience-image"
                                src="https://imgs.search.brave.com/m76M_P2x6d-LP9crPYcv9_x3EgIiE7fHS3LjbpOGEl8/rs:fit:860:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzAyLzAwLzk5Lzk5/LzM2MF9GXzIwMDk5/OTk3OF9pWVJISUVr/VWczWHJMY01RVFp6/R20wYTg4bWYzelQy/WS5qcGc"
                                alt="company-logo"
                              />
                            </div>
                            <div>
                              <br />
                              <strong>{item.organizationName}</strong>
                              <br />
                              <h3>{item.titleAtWork}</h3>
                              <p>
                                {new Intl.DateTimeFormat("en-US", {
                                  year: "numeric",
                                  month: "short",
                                }).format(
                                  new Date(item.relationshipTimestamp.startDate)
                                )}
                                -
                                {new Intl.DateTimeFormat("en-US", {
                                  year: "numeric",
                                  month: "short",
                                }).format(
                                  new Date(item.relationshipTimestamp.endDate)
                                )}
                              </p>
                              <br />
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div> */}
            {/* </div> */}
            <div className=" pb-8 grid items-center justify-between w-[120%] -ml-16  gap-8 grid-cols-2">
              {fetchedProfile?.attestationData &&
                fetchedProfile?.attestationData?.map(
                  (attestation: any, key: any) => {
                    console.log("307 attestation, key", key);

                    const message = JSON.parse(attestation?.decodedDataJson);
                    console.log(
                      "🚀 ~ file: ProfileCard.tsx:571 ~ ProfileCard ~ message:",
                      attestation
                    );
                    // console.log(
                    //   "🚀 ~ file: ProfileCard.tsx:310 ~ ProfileCard ~ message:",
                    //   message
                    // );
                    // console.log("Attestaion Message:", message[0]?.value.value);
                    const unixTimestamp = attestation?.timeCreated;
                    const formattedDate = formatUnixTimestamp(unixTimestamp);
                    // console.log(
                    //   "date 313",
                    //   message[0]?.value?.value? && BigInt(message[0]?.value?.value?.hex!).toString()
                    // );
                    if (typeof message !== "string")
                      return (
                        <Card
                          key={key}
                          className={`
            overflow-hidden
            ${"bg-white"}
            rounded-lg
            w-96 h-80 
            shadow-lg 
            p-4  
            transition-transform 
            transform hover:scale-105`}
                        >
                          <div className=" p-4  rounded-[calc(var(--card-radius)-var(--card-padding))] border-blue-300">
                            <div className="w-full  flex flex-col items-center text-center">
                              <h5 className="mb-2 text-2xl tracking-tighter font-semibold  text-gray-900 ">
                                Attestation {key + 1}
                              </h5>
                              <div className="flex gap-2 mb-2">
                                <p className=" text-[16px] font-sans  text-gray-600 ">
                                  Chain:{" "}
                                </p>
                                <span>
                                  <img
                                    alt="chain"
                                    className="w-6 h-6"
                                    src={`/src/assets/${
                                      attestation?.chainID == 10
                                        ? "optimism"
                                        : "ethereum"
                                    }.svg`}
                                  />
                                </span>
                              </div>
                            </div>
                            <div className=" w-full justify-between items-end text-end flex gap-2 mb-2 mt-4">
                              <p className="text-[16px] w-1/4 font-sans font-bold text-gray-700 ">
                                Recipient:
                              </p>
                              {/* <p className=" text-[16px] font-sans  text-gray-600 ">
                                  Message:{" "}
                                  {message[0]?.value?.value?.hex &&
                                    BigInt(
                                      message[0]?.value?.value?.hex!
                                    ).toString()}
                                </p> */}
                              <a
                                href={`https://optimism.easscan.org/address/${attestation?.recipient}`}
                                target="_blank"
                                className=" text-[16px] w-3/4 underline font-sans  text-gray-600 "
                              >
                                {attestation?.recipient.slice(0, 4) +
                                  "...." +
                                  attestation?.recipient.slice(-4)}
                              </a>
                            </div>
                            <div className=" w-full justify-between  flex gap-2 mb-[4px]">
                              <p className=" text-[16px] w-1/4 font-sans  font-bold text-gray-600 ">
                                Attester:{" "}
                              </p>
                              <div>
                                <a
                                  href={`https://optimism.easscan.org/address/${attestation?.attester}`}
                                  target="_blank"
                                  className=" text-[16px] w-3/4 underline font-sans  text-gray-600 "
                                >
                                  {attestation?.attester.slice(0, 4) +
                                    "...." +
                                    attestation?.attester.slice(-4)}
                                </a>
                              </div>
                            </div>
                            <div className="w-[100%] flex  justify-between gap-2 mb-[4px]">
                              <p className="text-[16px] 1/4 font-sans font-bold text-gray-700 ">
                                Issued:{" "}
                              </p>
                              <div>
                                <p className=" text-[16px] 3/4 font-sans  text-gray-600 ">
                                  {formattedDate}
                                </p>
                              </div>
                            </div>
                            <div className="w-full  justify-between items-end text-end flex gap-2 mb-[4px]">
                              <p className="text-[16px] 1/4 font-sans font-bold text-gray-700 ">
                                Expires:{" "}
                              </p>
                              <div>
                                <p className=" text-[16px] 3/4 font-sans  text-gray-600 ">
                                  {" "}
                                  {attestation?.expirationTime === 0
                                    ? "Never"
                                    : attestation?.expirationTime}
                                </p>
                              </div>
                            </div>
                            <div className="absolute right-4 mt-3">
                              <VerifyModal attestation={attestation} />
                            </div>
                            {/* <div className="w-full flex justify-center">
                        <button
                          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
                          type="submit"
                        >
                          Verify
                        </button>
                      </div> */}
                          </div>
                        </Card>
                      );
                  }
                )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
