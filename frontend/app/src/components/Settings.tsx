import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../@/components/ui/select";
import {AiOutlineAccountBook, AiOutlineAntDesign, AiOutlineBell} from "react-icons/ai";
import {Input} from "../../@/components/ui/input";
import {Button} from "../../@/components/ui/button";
import {Label} from "../../@/components/ui/label";

interface FormValues {
    searchEngine: string;
    ipfsGateway: string;
    minTrustScore: number;
    minGitcoinScore: number;
    trustedIssuers: { address: string; label: string; color: string }[];
}

export const Settings = () => {
    const {handleSubmit, control, register} = useForm<FormValues>({
        defaultValues: {
            searchEngine: "https://dili.com/search",
            ipfsGateway: "https://dili.com/ipfs",
            minTrustScore: 10,
            trustedIssuers: [
                {
                    address: "0x9cbC225B9d08502d231a6d8c8FF0Cc66aDcc2A4F",
                    label: "DILI EAS Signer",
                    color: "#40e0d0"
                }
            ]
        }
    });
    const {fields, append, remove} = useFieldArray({
        control,
        name: "trustedIssuers"
    });
    const onSubmit = (data: any) => {
        console.log(data);
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"p-4 space-y-4"}>
            <div>
                <Label htmlFor="searchEngine">Search engine</Label>
                <Select {...register("searchEngine")} autoComplete="on">
                    <SelectTrigger>
                        <SelectValue placeholder="Search backend"/>
                    </SelectTrigger>
                    <SelectContent id={"searchEngine"}>
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
                <Label htmlFor="minTrustScore">Min trust score for new connections</Label>
                <Input {...register("minTrustScore")} id={"minTrustScore"} type="number"
                       placeholder={"Min trust score for new connections"}/>
            </div>
            <div>
                <Label htmlFor="minGitcoinScore">Min GitCoin score for new connections</Label>
                <Input {...register("minGitcoinScore")} id={"minGitcoinScore"} type="number"
                       placeholder={"Min GitCoin score for new connections"}/>
            </div>
            <div>
                <Label htmlFor="ipfsGateway">IPFS Gateway</Label>
                <Select {...register("ipfsGateway")} autoComplete="on">
                    <SelectTrigger>
                        <SelectValue placeholder="Search backend"/>
                    </SelectTrigger>
                    <SelectContent id={"ipfsGateway"}>
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
            <div>
                <Label htmlFor="trustedIssuers">Trusted issuers</Label>
                <div id={"trustedIssuers"} className={"flex-col space-y-4"}>
                    {fields.map((item, index) => (
                        <fieldset key={item.id} className={"p-4 border-2 border-gray-300"}>
                            <Label htmlFor={`trustedIssuers.${index}.address`}>Address</Label>
                            <Controller
                                name={`trustedIssuers.${index}.address`}
                                control={control}
                                defaultValue={item.address}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`trustedIssuers.${index}.label`}>Friendly Name</Label>
                            <Controller
                                name={`trustedIssuers.${index}.label`}
                                control={control}
                                defaultValue={item.label}
                                render={({field}) => <Input {...field} />}
                            />
                            <Label htmlFor={`trustedIssuers.${index}.color`}>Label color</Label>
                            <Controller
                                name={`trustedIssuers.${index}.color`}
                                control={control}
                                defaultValue={item.color}
                                render={({field}) =>
                                    <Input type="color" {...field} />}
                            />
                            <button type="button" onClick={() => remove(index)}>
                                Remove
                            </button>
                        </fieldset>
                    ))}
                </div>
            </div>
            <Button
                type="button"
                onClick={() => append({address: '', label: '', color: '#ffffff'})}
            >
                Add Item
            </Button>
            <Button type="submit">Submit</Button>
        </form>
    );
}