import { useContext, useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  SubmitHandler,
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import "./ProfileEdit.css";
import { IoMdArrowBack } from "react-icons/io";
import { BACKEND_URL } from "./admin/EASConfigContext";
import { MessageWithViemSignature } from "./admin/types";
import { useWallet } from "../hooks/useWallet";
import { useWalletClient } from "wagmi";

import "./App.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { SupabaseContext } from "../contexts/SupabaseContext";
import { useResumeCache } from "../contexts/FileCacheContext";
import { ipfsDownload } from "../ipfs";
import Loading from "./Loading";
import { Dialog } from "@radix-ui/themes";

type PublishResumeMessage = {
  account: string;
  resume: string;
};
type OrganizationData = {
  organizationName: string;
  titleAtWork: string;
  relationshipTimestamp: {
    startDate: Date;
    endDate: Date;
  };
  organizationWebsite: string;
};
type FormInputs = {
  firstName: string;
  lastName: string;
  language: string;
  organizations: OrganizationData[];
  description: string;
  preferredName: string;
  preferredTitle: string;
  skillKeywords: string;
  preferredLocation: string;
};

export function ProfileEdit() {
  const location = useLocation();
  const { profileData } = location.state;
  console.log(
    "Fetched Profile Data in Edit",profileData
  )
  const [payload, setPayload] = useState("");
  const [cid, setCid] = useState(null);
  const [showCidData,setShowCidData] = useState(false)
  const [response, setResponse] = useState({});
  const [error, setError] = useState(null);
  const [attestationDatat, setAttestationsData] = useState();
  const [fetchedProfile,setFetchedProfile]=useState<FormInputs>()
  const { address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();
  const resumeCache = useResumeCache()
  const supabase = useContext(SupabaseContext);
  const { cid: profileCid } = useParams();
  const [loading,setLoading]=useState(false)
  console.log(address);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
    getValues,
  } = useForm<FormInputs>({
    defaultValues: {
      firstName: profileData?.firstName || "", 
      lastName: profileData?.lastName || "",
      language: profileData?.language || "",
      description: profileData?.description || "",
      preferredName: profileData?.preferredName || "",
      preferredTitle: profileData?.preferredTitle || "",
      skillKeywords: profileData?.skillKeywords || "",
      preferredLocation: profileData?.preferredLocation || "",
      organizations: profileData?.organizations || [], 
    },
  });


  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizations", 
  });
  useEffect(() => {
    if (profileData) {
      // Set values for non-organization fields from profileData
   

      // Clear existing organization fields
      if (fields.length > 0) {
        while (fields.length > 0) {
          remove(0);
        }
      }
  

      // Prefill organization fields after clearing existing ones
      profileData.organization.forEach((org:any, index:any) => {
        append({
          organizationName: org.organizationName,
          titleAtWork: org.titleAtWork,
          relationshipTimestamp: {
            startDate: org.relationshipTimestamp?.startDate || new Date(),
            endDate: org.relationshipTimestamp?.endDate || new Date(),
          },
          organizationWebsite: org.organizationWebsite,
        });
      });
    }
  }, [profileData]);
//   const fetchProfile = async (address:any) => {
//     try {
 
//     const {data} = await supabase
//         .from("resumes")
//         .select("cid")
//         .eq("address", address.toLowerCase())
//         .single();
//     if (!data?.cid) throw new Error("No CID found for this address");
//     console.log("CID:",data.cid)
//     const profileCid = data.cid
   
//         console.log("Fetching resume from IPFS");
//         const cacheEntry:any = resumeCache.get(profileCid)
//         if (cacheEntry) {
//             setFetchedProfile(cacheEntry);
//             return
//         }
//         const resume:any = await ipfsDownload(profileCid || "");
//         console.log("Fetched resume from IPFS: ", resume);
//         resumeCache.set(profileCid, {...resume, expiry: Date.now() + 1000 * 60 * 5})
//         setFetchedProfile(resume);
//     } catch
//         (error: any) {
//         console.log(error);
//     }
// };
// const fetchData = async () => {
//   try {
//     const response = await axios.get(
//       `http://159.203.132.121:3006/api/attestations?address=${address}`
//     );
//     console.log("Attestation Data", response.data);
//     setAttestationsData(response.data);
//     setLoading(false)
//   } catch (error) {
//     console.error("Error fetching attestation data data:", error);
//   }
// };
//   useEffect( () => {
//    setLoading(true)
//     fetchProfile(address);
//     fetchData();
   
   
//   }, []);
  // useEffect(() => {
  //   if (fetchedProfile && fetchedProfile.organizations) {
  //     reset({
  //       firstName: fetchedProfile.firstName,
  //       lastName: fetchedProfile.lastName,
  //       language: fetchedProfile.language,
  //       description: fetchedProfile.description,
  //       preferredName: fetchedProfile.preferredName,
  //       preferredTitle: fetchedProfile.preferredTitle,
  //       skillKeywords: fetchedProfile.skillKeywords,
  //       preferredLocation: fetchedProfile.preferredLocation,
  //       organizations: fetchedProfile.organizations.map(org => ({
  //         organizationName: org.organizationName,
  //         titleAtWork: org.titleAtWork,
  //         relationshipTimestamp: {
  //           startDate: new Date(org.relationshipTimestamp.startDate),
  //           endDate: new Date(org.relationshipTimestamp.endDate),
  //         },
  //         organizationWebsite: org.organizationWebsite,
  //         type: org.type,
  //       })),
  //     });
  //   }
  // }, [fetchedProfile, reset]);

  



  const onSubmit: SubmitHandler<FormInputs> = async (data, event) => {
    event?.preventDefault();
setLoading(true)
    try {
      if (!walletClient) throw new Error("Wallet client not initialized");
      if (!address) throw new Error("Wallet address not initialized");
      const formData = {
        firstName: data.firstName,
        lastName: data.lastName,
        language: data.language,
        organization: data.organizations,
        description: data.description,
        preferredName: data.preferredName,
        preferredTitle: data.preferredTitle,
        skillKeywords: data.skillKeywords,
        preferredLocation: data.preferredLocation,
        attestationData: attestationDatat,
      };
      console.log(JSON.stringify(formData));
      const message: PublishResumeMessage = {
        account: address?.toLowerCase(),
        resume: JSON.stringify(formData),
      };

      const signature = await walletClient.signMessage({
        account: address,
        message: JSON.stringify(message),
      });

      const requestBody: MessageWithViemSignature<PublishResumeMessage> = {
        message,
        signature,
      };

      const res2 = await fetch(`http://159.203.132.121:3005/api/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // headers: { 'Content-Type': 'multipart/form-data' },
        body: JSON.stringify(requestBody),
      }).then((res) => res.json());
      toast.success('🦄 Profile Updated', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
      setResponse(res2);
      toast(`CID: ${res2.cid}`, {
        position: "bottom-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
       setLoading(false)
       setShowCidData(true)
    } catch (err: any) {
      toast.error(err.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        });
        setLoading(false)
      setError(err.message);
    }
  };

  return (
    <>
      {" "}
      <div
        className="flex bg-white text-[#73b6ff] text-[18px] pt-5 pl-5 font-semibold cursor-pointer"
        onClick={() => {
          navigate(-1);
        }}
      >
        <IoMdArrowBack className="mt-1" />
        <p>Back</p>
      </div>
      {loading?<Loading/>:(
      <div className="flex flex-col min-h-screen h-fit  w-full bg-white justify-center align-middle">
        {!showCidData && <><div className="w-full flex justify-center"><h1 className="text-[24px] font-bold text-center mt-14">Edit your Profile</h1></div>
       <div className="flex justify-center"> <form
          onSubmit={handleSubmit(onSubmit)}
          className="  text-gray-800  font-montserrat h-fit mt-4 w-[600px] lg:p-10 p-6  bg-white bg-opacity-5 shadow-md  backdrop-blur rounded-xl border border-gray-400 border-opacity-18 "
        >
          <div className="flex gap-12">
            <div className=" flex flex-col w-[200px]">
            <label className="block  text-md font-medium text-gray-800">
                First Name:
              </label>
             <div className="input">
              <input
                type="text"
                {...register("firstName", { required: true })}
                placeholder="Your first name"
              />
             </div>
            </div>
            <br />
            <div className=" flex flex-col w-[200px]">
              <label className="block  text-md font-medium text-gray-800">
                Last Name:{" "}
              </label>
              <div className="input">
              <input
              {...register("lastName", { required: true })}
              placeholder="Your last name"
              /></div>
            </div>
          </div>

          <br />
          <div className="flex gap-24">
            <div className="flex flex-col w-[200px]">
              {" "}
              <label
                htmlFor="languages"
                className="block  text-md font-medium text-gray-800"
              >
                Languages
              </label> <div className="input">
              <input
              {...register("language", { required: true })}
              placeholder="Languages you speak"
              />
              </div>
            </div>

            <div className="flex flex-col w-[200px]">
              <label className="block  text-md font-medium text-gray-800">
                Description:{" "}
              </label>
              <div className="input">
              <input type="text"
                {...register("description", { required: true })}
                placeholder="Your bio"
                required
              /></div>
            </div>
          </div>
          {fields.map((organization, index) =>  (
            <div key={organization.id}>
              <div className="flex gap-[106px]"><label className="block  text-md font-medium text-gray-800">
                Organization Name:
                <div className="input">
                <input
                 placeholder="Organization"
                  required
                  type="text"
                  {...register(`organizations.${index}.organizationName`, {
                    required: true,
                  })}
                /></div>
              </label>
              <label className="block mb-2 text-md font-medium text-gray-800">
                Title:
                <div className="input">
                <input
                  placeholder="Job Title"
                  required
                  type="text"
                  {...register(`organizations.${index}.titleAtWork`, {
                    required: true,
                  })}
                /></div>
              </label></div>
              <label className="block mb-2 text-md text-center font-medium text-gray-800">
                TimeLine
              </label>

              <div  className="w-full flex justify-center">
                <div className="relative">
                 
                  <input
                    type="date"
                    {...register(
                      `organizations.${index}.relationshipTimestamp.startDate`,
                      { required: true }
                    )}
                    className="bg-gray-50 p-4 border-2 border-purple-500 text-gray-600 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-2.5 "
                    />
                </div>
                <span className="mx-4 text-gray-500">to</span>
                <div className="relative">
                  
                  <input
                    type="date"
                    {...register(
                      `organizations.${index}.relationshipTimestamp.endDate`,
                      { required: true }
                    )}
                    className="bg-gray-50 p-4 border-2 border-purple-500 text-gray-600 text-sm rounded-2xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-2.5 "
                  />
                </div>
              </div>
             
              <div className="w-full flex justify-center mt-6">
                {" "}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
                >
                  Remove Organization
                </button>
              </div>
            </div>
          ))}
          <div className="w-full flex justify-center mt-6">
            {" "}
            <button
              className="text-white bg-gradient-to-r  from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
              type="button"
              onClick={() =>
                append({
                  organizationName: "",
                  titleAtWork: "",
                  relationshipTimestamp: {
                    startDate: new Date(),
                    endDate: new Date(),
                  },
                  organizationWebsite: "",
                })
              }
            >
              Add Organization
            </button>{" "}
          </div>
          <br />

          <div className="flex gap-14">
            <div>
              <label className="block  text-md font-medium text-gray-800">
                Preferred Name:
                <div className="input">  <input
                  type="text"
                  {...register("preferredName", { required: true })}
                  placeholder="Your preferred name"
                /></div>
              </label>
            </div>
            <br />
            <div>
              <label className="block  text-md font-medium text-gray-800">
                Preferred Title:
                <div className="input"> <input
                  type="text"
                  {...register("preferredTitle", { required: true })}
                  placeholder="Your preferred title"
                /></div>
              </label>
            </div>
            <br />
          </div>
          <div className="flex gap-14">
            <div>
              <label className="block  text-md font-medium text-gray-800">
                Skills:
                <div className="input">
                <input
                  type="text"
                  {...register("skillKeywords", { required: true })}
                  placeholder=" Your skills"
                /></div>
              </label>
            </div>
            <br />
            <div>
              <label className="block  text-md font-medium text-gray-800">
                Preferred Location:
                <div className="input"> <input
                  type="text"
                  {...register("preferredLocation", { required: true })}
                  placeholder="Your Location"
                /></div>
              </label>
            </div>
            <br />
          </div>
          <div className="w-full flex justify-center mt-2"><button
            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 "
            type="submit"
          >
            Upload to IPFS
          </button></div>
        </form></div></>}
        {cid && showCidData && <div>CID: {cid}</div>}
        {error && <div>Error: {error}</div>}
        {response && JSON.stringify(response)}
      </div>)}

      <ToastContainer
/>
<ToastContainer />
    </>
  );
}

function append(arg0: {
  organizationName: string;
  titleAtWork: string;
  relationshipTimestamp: string;
  organizationWebsite: string;
  type: string;
}) {
  throw new Error("Function not implemented.");
}
