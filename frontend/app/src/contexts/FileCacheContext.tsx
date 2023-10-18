import {createContext, FC, PropsWithChildren, useContext} from "react";
import {Resume} from "../types";
import {FileCache} from "../cache";

export const ResumeCache = createContext<FileCache<Resume & {expiry: number}>>(new FileCache())

export const useResumeCache = () => useContext(ResumeCache)
