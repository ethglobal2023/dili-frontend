import React, { useContext, useEffect, useState } from "react";
import FileUploadModal from "./FileUpload";
import "./ProfileCard.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Resume, IndexedUser } from "../types";
import { ipfsDownload } from "../ipfs";
import { IoMdArrowBack } from "react-icons/io";
import "./App.css";
import { useWallet } from "../hooks/useWallet";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { useResumeCache } from "../contexts/FileCacheContext";
// import { useWallet } from "../hooks/useWallet";
// import { SupabaseContext } from "../contexts/SupabaseContext";
// import { useResumeCache } from "../contexts/FileCacheContext";
import axios from "axios";
import SocialBadge from "./SocialBadge";
import Loading from "./Loading";
import Avatar, { genConfig } from "react-nice-avatar";
// import Avatar, { genConfig } from "react-nice-avatar";
export default function ProfileCard() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState({});
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const { address: walletAddress } = useWallet();
  const [loading, setLoading] = useState(false);
  const supabase = useContext(SupabaseContext);
  const resumeCache = useResumeCache();


  const getImage = (event: any) => {
    setCurrentImage(event.target.files[0]);
  };


  //@Sakshi, this is the logic for fetching the resume from IPFS
  const [error, setError] = useState("");
  const [fetchedProfile, setFetchedProfile] = useState<Resume>();
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let stageCid = cid;

        if (!stageCid) {
          console.log("No cid provided");
          setLoading(false);
          return;
        }
        if (stageCid === "self") {
          console.log(
            "No cid provided, but self, searching supabase for wallet address",
            walletAddress?.toLowerCase()
          );
          if (!walletAddress) {
            console.log("No wallet, nor cid provided to profile card");
            setLoading(false);
            return;
          }
          const { data } = await supabase
            .from("resumes")
            .select("cid")
            .eq("address", walletAddress.toLowerCase())
            .single();
          if (!data?.cid) throw new Error("No CID found for this address");
          console.log("CID:", data.cid);
          stageCid = data.cid;
        }
        console.log("Fetching resume from IPFS");
        const cacheEntry = resumeCache.get(stageCid);
        if (cacheEntry) {
          setFetchedProfile(cacheEntry);
          return;
        }
        const resume = await ipfsDownload(stageCid || "");
        console.log("Fetched resume from IPFS: ", resume);
        resumeCache.set(stageCid, {
          ...resume,
          expiry: Date.now() + 1000 * 60 * 5,
        });
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


  return (
    <>
      {/* {loading?<Loading/>: */}
      <div className="bg-white w-full">
        <div
          className="flex text-[#73b6ff] text-[18px] mt-5 ml-5 font-semibold cursor-pointer"
          onClick={() => {
            navigate("/");
          }}
        >
          <IoMdArrowBack className="mt-1" />
          <p>Back</p>
        </div>
        <div className=" flex gap-[32px]">
          <FileUploadModal
            getImage={getImage}
            uploadImage={uploadImage}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            currentImage={currentImage}
            progress={progress}
          />
          <div className="ml-10">
            <div className="  text-gray-800 font-montserrat h-fit mt-12 w-[700px] lg:p-10 p-6  card rounded-xl ">
              <div className="profile-info">
                <div>
                  <div className=" flex">
                    <div>
                      <Avatar
                        style={{ width: "8rem", height: "8rem" }}
                        className="rounded-full"
                        {...config}
                      />
                    </div>
                    <div className="w-full flex justify-end mt-6 py-6">
                      <Link
                        to="/profileEdit"
                        state={{ profileData: fetchedProfile }}
                      >
                        <button
                          className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                          type="button"
                          onClick={() => {
                            navigate("/profileEdit");
                          }}
                        >
                          Edit profile
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div className="w-full flex justify-between gap-[215px]">
                    {" "}
                    <div className="">
                      {" "}
                      <h3 className=" text-[18px] font-sans font-bold text-gray-600 mt-2">
                        {fetchedProfile?.firstName} {fetchedProfile?.lastName}
                      </h3>
                      <p className=" text-[16px] font-sans font-medium text-gray-500">
                        {fetchedProfile?.description}
                      </p>
                      <p className=" text-[16px] font-sans  text-gray-500 ">
                        {fetchedProfile?.preferredLocation}
                      </p>
                      <p className=" text-[16px] font-sans  text-gray-500 ">
                        <span className="font-bold">Skills</span>:&nbsp;
                        {fetchedProfile?.skillKeywords}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-gray-800 font-montserrat h-fit mt-12 w-[700px] lg:p-10 p-6  card rounded-xl">
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
            </div>
          </div>
          {fetchedProfile?.attestationData &&
            fetchedProfile?.attestationData?.map(
              (attestation: any, key: any) => {
                const message = JSON.parse(attestation?.decodedDataJson);
                console.log("Attestaion Message:", message[0]?.value.value);
                const unixTimestamp = attestation?.timeCreated;
                const formattedDate = formatUnixTimestamp(unixTimestamp);
                console.log(formattedDate);

                return (
                  <div
                    className="text-gray-800 font-montserrat h-fit mt-12 w-[700px]   card rounded-xl "
                    key={key}
                  >
                    <div className=" p-4 border-2 rounded-lg border-blue-300">
                      <a href="#" className="w-full text-center">
                        <h5 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900 ">
                          Attestation
                        </h5>
                        <p className=" text-[16px] font-sans  text-gray-600 ">
                          Chain ID: {attestation?.chainID}
                        </p>
                      </a>
                      <div className=" flex gap-2 mb-[4px]">
                        <p className="text-[16px] font-sans font-bold text-gray-700 ">
                          Data:{" "}
                        </p>
                        <div>
                          <p className=" text-[16px] font-sans  text-gray-600 ">
                            Message: {message[0]?.value.value}
                          </p>
                          <p className=" text-[16px] font-sans  text-gray-600 ">
                            Recipient:{" "}
                            {attestation?.recipient.slice(0, 4) +
                              "...." +
                              attestation?.recipient.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className=" flex gap-2 mb-[4px]">
                        <p className=" text-[16px] font-sans font-bold text-gray-600 ">
                          Attester:{" "}
                        </p>
                        <div>
                          <p className=" text-[16px] font-sans  text-gray-600 ">
                            {attestation?.attester.slice(0, 4) +
                              "...." +
                              attestation?.attester.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className=" flex gap-2 mb-[4px]">
                        <p className="text-[16px] font-sans font-bold text-gray-700 ">
                          Issued:{" "}
                        </p>
                        <div>
                          <p className=" text-[16px] font-sans  text-gray-600 ">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className=" flex gap-2 mb-[4px]">
                        <p className="text-[16px] font-sans font-bold text-gray-700 ">
                          Expires:{" "}
                        </p>
                        <div>
                          <p className=" text-[16px] font-sans  text-gray-600 ">
                            {" "}
                            {attestation?.expirationTime}
                          </p>
                        </div>
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
                  </div>
                );
              }
            )}
        </div>
      </div>
      
      {/* } */}
    </>
  );
}
