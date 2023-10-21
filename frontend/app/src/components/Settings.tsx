import {useNavigate} from "react-router-dom"
import {Controller, useForm} from 'react-hook-form';
import {Box} from "@radix-ui/themes";
import {Select} from "../../@/components/ui/select";
import {AiFillAlert, AiOutlineAccountBook} from "react-icons/ai";
import {Input} from "../../@/components/ui/input";
import {Button} from "../../@/components/ui/button";

const Settings = () => {
    const navigate = useNavigate()

    const {handleSubmit, control} = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
                <label>Search Engine</label>
                <Controller
                    name="searchEngine"
                    control={control}
                    defaultValue="DILI - https://backend.com"
                    render={({field}) => (
                        <Select {...field} autoComplete="on">
                            <option value="DILI - https://backend.com">
                                <AiOutlineAccountBook name="placeholder-icon"/> DILI - https://backend.com
                            </option>
                            <option value="DILI - https://backend.com">
                                <AiFillAlert name="placeholder-icon"/> DILI2 - https://backen2d.com
                            </option>
                            <option value="DILI - https://backend2.com">
                                <AiFillAlert name="placeholder-icon"/> DILI2 - https://backen2d.com
                            </option>
                        </Select>
                    )}
                />
            </Box>

            <Box>
                <label>Default IPFS Gateway</label>
                <Controller
                    name="defaultGateway"
                    control={control}
                    defaultValue="DILI - https://ipfs-gateway.com"
                    render={({field}) => (
                        <Select {...field} autoComplete="on">
                            <option value="DILI - https://ipfs-gateway.com">
                                <AiOutlineAccountBook name="placeholder-icon"/> DILI - https://backend.com
                            </option>
                            <option value="DILI - https://ipfs-gateway.com">
                                <AiOutlineAccountBook name="placeholder-icon"/> DILI - https://backend.com
                            </option>
                            <option value="DILI - https://ipfs-gateway.com">
                                <AiOutlineAccountBook name="placeholder-icon"/> DILI - https://backend.com
                            </option>
                            {/* Add more options as needed */}
                        </Select>
                    )}
                />
            </Box>

            <Box>
                <label>Minimum Trust Score for New Connections</label>
                <Controller
                    name="minTrustScore"
                    control={control}
                    defaultValue="10"
                    render={({field}) => <Input {...field} type="number"/>}
                />
            </Box>

            <Box>
                <label>Trusted Credential Issuers</label>
                {/* This is a simplistic approach. You might want to create a more complex UI for managing a list of trusted issuers. */}
                <Controller
                    name="trustedIssuers"
                    control={control}
                    defaultValue={[{WalletAddress: 'MY_SIGNING_KEY', FriendlyName: 'DILI', Color: '#666666'}]}
                    render={({field}) => {
                        // Render your trusted issuers list here, you might need a custom component to handle the list
                        return (<Box>
                                <Input {...field} type="hidden"/>
                            </Box>)
                    }}
                />
            </Box>

            <Button type="submit">Submit</Button>
        </form>
    );
}