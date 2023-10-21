import {Controller, useFieldArray, useForm} from 'react-hook-form';
import {Select, SelectItem, SelectContent, SelectTrigger, SelectValue} from "../../@/components/ui/select";
import {AiFillAlert, AiOutlineAccountBook} from "react-icons/ai";
import {Input} from "../../@/components/ui/input";
import {Button} from "../../@/components/ui/button";
import {Label} from "../../@/components/ui/label";

interface FormValues {
    searchEngine: string;
    ipfsGateway: string;
    minTrustScore: number;
    trustedIssuers: { address: string; label: string; color: string }[];
}

export const Settings = () => {
    const {handleSubmit, control, register} = useForm<FormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "trustedIssuers"
    });
    const onSubmit = (data: any) => {
        console.log(data);
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className={"p-4 space-y-4"}>
            <Label htmlFor="searchEngine">Search engine</Label>
            <Select {...register("searchEngine")}  autoComplete="on">
                <SelectTrigger>
                    <SelectValue placeholder="Search backend"/>
                </SelectTrigger>
                <SelectContent id={"searchEngine"}>
                    <SelectItem value="https://backend.com">
                        <AiOutlineAccountBook name="placeholder-icon"/> DILI - https://backend.com
                    </SelectItem>
                    <SelectItem value="dark">
                        <AiFillAlert name="placeholder-icon"/> TalentLayer - https://backen2d.com
                    </SelectItem>
                    <SelectItem value="system">
                        <AiFillAlert name="placeholder-icon"/> DILI3 - https://backen2d.com
                    </SelectItem>
                </SelectContent>
            </Select>
            <Label htmlFor="minTrustScore">Min trust score for new connections</Label>
            <Input {...register("minTrustScore")} id={"minTrustScore"} type="number" placeholder={"Min trust score for new connection"}/>

            <Label htmlFor="ipfsGateway">IPFS Gateway</Label>
            <Select {...register("ipfsGateway")}  autoComplete="on">
                <SelectTrigger>
                    <SelectValue placeholder="Search backend"/>
                </SelectTrigger>
                <SelectContent id={"ipfsGateway"}>
                    <SelectItem value="https://backend.com">
                        <AiOutlineAccountBook name="placeholder-icon"/>Cloudflare - https://backend.com
                    </SelectItem>
                    <SelectItem value="dark">
                        <AiFillAlert name="placeholder-icon"/> DILI - https://backen2d.com
                    </SelectItem>
                    <SelectItem value="system">
                        <AiFillAlert name="placeholder-icon"/> web3.storage - https://web3.storage
                    </SelectItem>
                </SelectContent>
            </Select>
            {fields.map((item, index) => (
                <fieldset key={item.id}>
                    <Controller
                        name={`items[${index}].Wa`}
                        control={control}
                        defaultValue={item.address}
                        render={({ field }) => <Input {...field} />}
                    />
                    <Controller
                        name={`items[${index}].label`}
                        control={control}
                        defaultValue={item.label}
                        render={({ field }) => <input {...field} />}
                    />
                    <Controller
                        name={`items[${index}].color`}
                        control={control}
                        defaultValue={item.color}
                        render={({ field }) => <input type="color" {...field} />}
                    />
                    <button type="button" onClick={() => remove(index)}>
                        Remove
                    </button>
                </fieldset>
            ))}
            <button
                type="button"
                onClick={() => append({ address: '', label: '', color: '#ffffff' })}
            >
                Add Item
            </button>
            <button type="submit">Submit</button>


            <Button type="submit">Submit</Button>
        </form>
    );
}