import { useContext, useEffect, useState } from "react";
import {
  SubmitHandler,
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import "./ProfileEdit.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoMdArrowBack } from "react-icons/io";
import { BACKEND_URL } from "./admin/EASConfigContext";
import { MessageWithViemSignature } from "./admin/types";
import { useWallet } from "../hooks/useWallet";
import { useWalletClient } from "wagmi";
import { DatePicker } from "antd";
import "./App.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { SupabaseContext } from "../contexts/SupabaseContext";
import { useResumeCache } from "../contexts/FileCacheContext";
import { ipfsDownload } from "../ipfs";
import Loading from "./Loading";
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
  type: "education" | "work" | "volunteer";
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

export function ProfilePublish() {
  const [payload, setPayload] = useState("");
  const [cid, setCid] = useState(null);
  const [response, setResponse] = useState({});
  const [error, setError] = useState(null);
  const [attestationDatat, setAttestationsData] = useState();
  const { address } = useWallet();
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();
  const resumeCache = useResumeCache()
  const supabase = useContext(SupabaseContext);
  const [loading,setLoading]=useState(false)
  console.log(address);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({});
  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizations",
  });
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `http://159.203.132.121:3005/api/attestations?address=${address}`
      );
      console.log("Attestation Data", response.data);
      setAttestationsData(response.data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching attestation data data:", error);
    }
  };
    useEffect( () => {
     setLoading(true)
      fetchData();
     
     
    }, []);

  const onSubmit: SubmitHandler<FormInputs> = async (data, event) => {
    event?.preventDefault();

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

      const res2 = await fetch(`${BACKEND_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // headers: { 'Content-Type': 'multipart/form-data' },
        body: JSON.stringify(requestBody),
      }).then((res) => res.json());

      setResponse(res2);
    } catch (err: any) {
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
      {loading?<Loading/>:(<div className="flex flex-col min-h-screen h-fit  w-full bg-white justify-center align-middle">
        <div className="w-full flex justify-center"><h1 className="text-[24px] font-bold text-center mt-14">Create your Profile</h1></div>
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
          {fields.map((organization, index) => (
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
              <label className="block mb-2 text-md font-medium text-gray-800">
                TimeLine
              </label>

              <div date-rangepicker className="flex items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                    </svg>
                  </div>
                  <input
                    {...register(
                      `organizations.${index}.relationshipTimestamp.startDate`,
                      {
                        required: true,
                      }
                    )}
                    name="start"
                    type="text"
                    date-rangepicker="true"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 "
                    placeholder="Select date start"
                  />
                </div>
                <span className="mx-4 text-gray-500">to</span>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                    </svg>
                  </div>
                  <input
                    {...register(
                      `organizations.${index}.relationshipTimestamp.endDate`,
                      {
                        required: true,
                      }
                    )}
                    name="end"
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  "
                    placeholder="Select date end"
                  />
                </div>
              </div>
              <div className="w-full flex justify-center"><div><label className="block text-md font-medium text-gray-800 mt-6">
                Type
              </label>
              <div className="input">
              <select
                {...register("language", { required: true })}
                id="languages"
                >
                <option selected>Choose a Type</option>
                <option value="Education">Education</option>
                <option value="Experience">Experience</option>
                <option value="Volunteer">Volunteer</option>
              </select></div></div></div>
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
                  type: "education",
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
        </form></div>
        {cid && <div>CID: {cid}</div>}
        {error && <div>Error: {error}</div>}
        {response && JSON.stringify(response)}
      </div>)}
      <ToastContainer
position="bottom-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
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
