// import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
// import {SupabaseContext} from "./SupabaseContext";
// import {useWallet} from "../hooks/useWallet";
//
//
// type UserData = {
//     resumeCid?: string;
//     forceRefresh: boolean
// }
//
// export const MyUserContext = createContext<UserData>({
//     forceRefresh: true
// })
//
//
// export const MyUserContextProvider: React.FC<PropsWithChildren> = ({children}) => {
//     const [data, setData] = useState<UserData>({
//         forceRefresh: false
//     });
//     const {address} = useWallet()
//     const supabase = useContext(SupabaseContext);
//       useEffect(() => {
//           const fetchData = async () => {
//             try {
//                 if(!address){
//                     console.log("User isn't signed into their wallet, can't fetch data")
//                     return
//                 }
//                 const {data: userData, error} = await supabase
//                     .from("resumes")
//                     .select("cid")
//                     .eq("pk", address).single()
//                 if (error) {
//                     console.error("Error fetching data:", error);
//                     return;
//                 }
//               const response = await fetch(`https://api.example.com/data`);
//               const result = await response.json();
//               setData(result);
//             } catch (error) {
//               console.error('Error fetching data:', error);
//             }
//           };
//
//           fetchData();
//           const intervalId = setInterval(fetchData, 30000);
//
//           return () => clearInterval(intervalId);
//         }, [address, data.forceRefresh]);
//
//
// }