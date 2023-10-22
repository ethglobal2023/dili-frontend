import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../@/components/ui/select";
import {AiOutlineAccountBook, AiOutlineAntDesign, AiOutlineBell} from "react-icons/ai";
import {Input} from "../../@/components/ui/input";
import {Button} from "../../@/components/ui/button";
import {Label} from "../../@/components/ui/label";
import {Checkbox} from "../../@/components/ui/checkbox";
import {useContext, useEffect, useState} from "react";
import {SupabaseContext} from "../contexts/SupabaseContext";
import useEthersWalletClient from "../hooks/useEthersWalletClient";
import {Textarea} from "../../@/components/ui/textarea";

export interface UserSettings {
    default_search_engine: string;
    default_ipfs_gateway: string;
    min_trust_score: number;
    min_gitcoin_score: number;
    trusted_wallets: { address: string; label: string; color: string }[];
    untrusted_wallets: { address: string; label: string; color: string }[];
    user_high_reputation_reply: string;
    user_low_reputation_reply: string;
    default_automatic_reply: string;
    require_connection_announcement_to_connect: boolean;
    disable_auto_reply: boolean
}

export const Settings = () => {
    const {data: walletClient} = useEthersWalletClient();
    const [loading, setLoading] = useState(true);
    const {handleSubmit, control, register, setValue} = useForm<UserSettings>({
        defaultValues: {
            default_search_engine: "https://dili.com/search",
            default_ipfs_gateway: "https://dili.com/ipfs",
            min_trust_score: 10,
            min_gitcoin_score: 10,
            trusted_wallets: [
                {
                    address: "0x9cbC225B9d08502d231a6d8c8FF0Cc66aDcc2A4F",
                    label: "DILI EAS Signer",
                    color: "#40e0d0"
                }
            ],
            untrusted_wallets: [
                {
                    address: "0x9cbC225B9d08502d231a6d8c8FF0Cc66aDcc2A4F",
                    label: "DILI EAS Signer",
                    color: "#FF0000"
                }
            ],
            user_high_reputation_reply: "This is my automatic reply",
            user_low_reputation_reply: "reply automatic my is This",
            default_automatic_reply: "default reply",
            require_connection_announcement_to_connect: true,
        }
    });
    const supabase = useContext(SupabaseContext);
    const {fields: trustedWalletsFields, append: trustedWalletsAppend, remove: trustedWalletsRemove} = useFieldArray({
        control,
        name: "trusted_wallets"
    });
    const {fields: untrustedWalletsFields, append: untrustedWalletsAppend, remove: untrustedWalletsRemove} = useFieldArray({
        control,
        name: "untrusted_wallets"
    });
    const onSubmit = async (data: UserSettings) => {
        console.log("Saving user settings, raw data:", data);
        try {

            const address = walletClient.getAddress
            await supabase.from("user_settings").upsert({
                id: address.toString(),
                default_search_engine: data.default_search_engine,
                default_ipfs_gateway: data.default_ipfs_gateway,
                min_trust_score: data.min_trust_score,
                min_gitcoin_score: data.min_gitcoin_score,
                trusted_wallets: data.trusted_wallets,
                untrusted_wallets: data.untrusted_wallets,
                user_high_reputation_reply: data.user_high_reputation_reply,
                user_low_reputation_reply: data.user_low_reputation_reply,
                default_automatic_reply: data.default_automatic_reply,
                require_connection_announcement_to_connect: data.require_connection_announcement_to_connect,
                disable_auto_replace: data.disable_auto_reply
            })
            console.log("Saved user settings, fetching from db to verify")
            const res = await supabase.from("user_settings").select("*").eq("id", address.toString()).single()
            console.log("Fetched from db to verify saved settings", res)
        } catch (e: any) {
            console.log("Failed to save user settings:")
        }
    };
    useEffect(() => {

        const fetchData = async () => {
            const {data, error} = await supabase.from("user_settings").select("*").eq("id", walletClient.getAddress().toString()).single()

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            if (data) {
                setValue("default_search_engine", data.default_search_engine || "https://dili.com/search")
                setValue("default_ipfs_gateway", data.default_ipfs_gateway || "https://dili.com/ipfs")
                setValue("min_trust_score", data.min_trust_score || 10)
                setValue("min_gitcoin_score", data.min_gitcoin_score || 10)
                // @ts-ignore
                setValue("trusted_wallets", data.trusted_wallets || [])
                // @ts-ignore
                setValue("untrusted_wallets", data.untrusted_wallets || [])
                setValue("user_high_reputation_reply", data.user_high_reputation_reply || "This is my auto-reply to users with high reputation")
                setValue("user_low_reputation_reply", data.user_low_reputation_reply || "This is my auto-reply to users with low reputation")
                setValue("default_automatic_reply", data.default_automatic_reply || "This is my default auto-reploy")
                setValue("require_connection_announcement_to_connect", data.require_connection_announcement_to_connect || true)
                setValue("disable_auto_reply", data.disable_auto_reply || false)
            }
            setLoading(false);
        };
        fetchData();
    }, [])

    if (loading) return <div>Loading user settings...</div>
    // TODO Would be nice to print out error dialogs
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"p-4 space-y-4"}>
            <div>
                <Label htmlFor="searchEngine">Search engine</Label>
                <Select {...register("default_search_engine")} autoComplete="on">
                    <SelectTrigger>
                        <SelectValue placeholder="Search backend"/>
                    </SelectTrigger>
                    <SelectContent id={"default_search_engine"}>
                        <SelectItem value="https://dili.com/search">
                            <div className={"flex align-middle space-x-2"}>
                                <AiOutlineAccountBook name="placeholder-icon"/>
                                <span>Cloudflare - https://dili.com/search</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="https://www.talentlayer.org">
                            <div className={"flex align-middle space-x-2"}>
                                <AiOutlineAccountBook name="placeholder-icon"/>
                                <span>TalentLayer - https://www.talentlayer.org</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="min_trust_score">Min trust score for new connections</Label>
                <Input {...register("min_trust_score")} id={"min_trust_score"} type="number"
                       placeholder={"Min trust score for new connections"}/>
            </div>
            <div>
                <Label htmlFor="min_gitcoin_score">Min GitCoin score for new connections</Label>
                <Input {...register("min_gitcoin_score")} id={"min_gitcoin_score"} type="number"
                       placeholder={"Min trust score for new connections"}/>
            </div>
            <div>
                <Label htmlFor={"user_high_reputation_reply"}>Auto-reply message to users w/ high reputation</Label>
                <Textarea {...register("user_high_reputation_reply")} id={"user_high_reputation_reply"}
                       placeholder={"Auto-reply message to users w/ high reputation"}/>
            </div>

            <div>
                <Label htmlFor={"user_low_reputation_reply"}>Auto-reply message to users w/ low reputation</Label>
                <Textarea {...register("user_low_reputation_reply")} id={"user_low_reputation_reply"}
                       placeholder={"Auto-reply message to users w/ low reputation"}/>
            </div>
            <div>
                <Label htmlFor={"default_automatic_reply"}>Default automatic reply, or third reply option</Label>
                <Textarea {...register("default_automatic_reply")} id={"default_automatic_reply"}
                       placeholder={"Default automatic reply/third auto-reply message"}/>
            </div>
            <div>
                <Label htmlFor="">IPFS Gateway</Label>
                <Select {...register("default_ipfs_gateway")} autoComplete="on">
                    <SelectTrigger>
                        <SelectValue placeholder="Search backend"/>
                    </SelectTrigger>
                    <SelectContent id={"default_ipfs_gateway"}>
                        <SelectItem value="https://cloudflare-ipfs.com/ipfs">
                            <div className={"flex align-middle space-x-2"}>
                                <AiOutlineAccountBook name="placeholder-icon"/>
                                <span>Cloudflare - https://cloudflare-ipfs.com/ipfs</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="https://dili.com">
                            <div className={"flex align-middle space-x-2"}>
                                <AiOutlineAntDesign name="placeholder-icon"/>
                                <span>DILI - https://dili.com</span>
                            </div>
                        </SelectItem>
                        <SelectItem value="https://w3s.link/ipfs">
                            <div className={"flex align-middle space-x-2"}>
                                <AiOutlineBell name="placeholder-icon"/>
                                <span>Cloudflare - https://w3s.link/ipfs</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center  space-x-2">
                <Checkbox {...register("require_connection_announcement_to_connect")}
                          id={"require_connection_announcement_to_connect"}/>
                <Label htmlFor={"require_connection_announcement_to_connect"}>Require connection announcements to
                    connect</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox {...register("disable_auto_reply")} id={"disable_auto_reply"}/>
                <Label htmlFor={"disable_auto_reply"}>Disable auto reply</Label>
            </div>
            <div>
                <Label htmlFor="trusted_wallets">Trusted wallets</Label>
                <div id={"trusted_wallets"} className={"flex-col space-y-4"}>
                    {trustedWalletsFields.map((item, index) => (
                        <fieldset key={item.id} className={"p-4 border-2 border-gray-300"}>
                            <Label htmlFor={`trusted_wallets.${index}.address`}>Address</Label>
                            <Controller
                                name={`trusted_wallets.${index}.address`}
                                control={control}
                                defaultValue={item.address}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`trusted_wallets.${index}.label`}>Friendly Name</Label>
                            <Controller
                                name={`trusted_wallets.${index}.label`}
                                control={control}
                                defaultValue={item.label}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`trusted_wallets.${index}.color`}>Label color</Label>
                            <Controller
                                name={`trusted_wallets.${index}.color`}
                                control={control}
                                defaultValue={item.color}
                                render={({field}) =>
                                    <Input type="color" {...field} />}
                            />
                            <button type="button" onClick={() => trustedWalletsRemove(index)}>
                                Remove
                            </button>
                        </fieldset>
                    ))}
                </div>
                <div className={"flex justify-center p-4"}>
                    <Button
                        type="button"
                        onClick={() => trustedWalletsAppend({address: '', label: '', color: '#ffffff'})}
                    >
                        Add new trusted wallet
                    </Button>
                </div>
                <Label htmlFor="trusted_wallets">Untrusted wallets</Label>
                <div id={"untrusted_wallets"} className={"flex-col space-y-4"}>
                    {untrustedWalletsFields.map((item, index) => (
                        <fieldset key={item.id} className={"p-4 border-2 border-gray-300"}>
                            <Label htmlFor={`untrusted_wallets.${index}.address`}>Address</Label>
                            <Controller
                                name={`untrusted_wallets.${index}.address`}
                                control={control}
                                defaultValue={item.address}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`untrusted_wallets.${index}.label`}>Friendly Name</Label>
                            <Controller
                                name={`untrusted_wallets.${index}.label`}
                                control={control}
                                defaultValue={item.label}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`untrusted_wallets.${index}.color`}>Label color</Label>
                            <Controller
                                name={`untrusted_wallets.${index}.color`}
                                control={control}
                                defaultValue={item.color}
                                render={({field}) =>
                                    <Input type="color" {...field} />}
                            />
                            <button type="button" onClick={() => untrustedWalletsRemove(index)}>
                                Remove
                            </button>
                        </fieldset>
                    ))}
                </div>
            </div>
            <div className={"flex justify-center"}>
                <Button
                    type="button"
                    onClick={() => untrustedWalletsAppend({address: '', label: '', color: '#ffffff'})}
                >
                    Add new untrusted issuer
                </Button>
            </div>
            <Button type="submit">Submit</Button>
        </form>
    );
}