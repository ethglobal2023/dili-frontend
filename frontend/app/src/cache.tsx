import {ipfsDownload} from "./ipfs";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database} from "./__generated__/supabase-types";

export class FileCache<V extends { expiry: number }> {

    // TODO Use custom key type
    private cacheType: string = "resume"
    private ttl: number; // 5 minutes
    constructor(ttl: number = 1000 * 60 * 5) {
        this.ttl = ttl
    }


    get(key: string): V | null {
        try {
            const data = localStorage.getItem(key)
            if (!data) {
                return null
            }
            const resume: V = JSON.parse(data)
            if (resume.expiry < Date.now()) {
                return null
            }
            return resume
        } catch (e: any) {
            console.error(`Failed to get value from ${this.cacheType}:`, e.message)
            return null
        }
    }

    set(key: string, value: V) {
        try {
            value.expiry = Date.now() + this.ttl
            localStorage.setItem(key, JSON.stringify(value))
        } catch (e: any) {
            console.error(`Failed to set value in ${this.cacheType}:`, e.message)
        }
    }
}


export const loadCidIntoCache = async (cid: string, supabase: SupabaseClient<Database>, cache: FileCache<any & { expiry: number }>) => {
    if (!cid) {
        //You do not want to uncomment the below unless you're troubleshooting cache behavior
        //console.log("User has no CID, skipping")
        return
    }
    if (cache.get(cid)) {
        //console.log("User already in cache, skipping")
        return
    }
    console.log("No cache entry found for: ", cid)
    try {
        const profile = await ipfsDownload(cid)
        if (profile) {
            console.log("Downloaded resume for: ", cid)
            cache.set(cid, {...profile, expiry: Date.now() + 1000 * 60 * 5})
        }
    } catch (e: any) {
        console.error("Error fetching resume to store in cache: ", e.message)
    }
}