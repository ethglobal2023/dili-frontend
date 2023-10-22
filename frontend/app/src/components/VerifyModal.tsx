import {FC, useEffect, useState} from "react"
import {Link} from "react-router-dom";
import {Button} from "../../@/components/ui/button";
import {AiFillCheckSquare} from "react-icons/ai";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "../../@/components/ui/dialog";
import {DialogProps} from "@radix-ui/react-dialog";

export const VerifyModal: FC<{ attestation: Object } & DialogProps> = ({attestation, ...dialogProps}) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [verifySuccessful, setVerifySuccessful] = useState<boolean>(false)

    console.log("loaded attestation into modal:", attestation)

    useEffect(() => {
        if (!loading) return
        const verify = async () => {
            console.log("Much cool, very wow")
            try {
                setVerifySuccessful(true)
            } catch (e: any) {
                console.log(e)
            }
            setLoading(false)
        }
        verify()
    }, [loading])

    return (
        <Dialog {...dialogProps}>
            <DialogTrigger asChild>
                <Button variant="outline">VERIFY</Button>
            </DialogTrigger>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify attestation</DialogTitle>
                    </DialogHeader>
                    {!loading &&
                        <Button onClick={() => setLoading(true)}>Click here to verify</Button>}
                    {!loading && verifySuccessful && (<>
                        <div className={"flex align-middle"}>
                            <AiFillCheckSquare/>
                            <span>Valid attestation</span>
                        </div>
                        <div className={"flex"}>
                            <AiFillCheckSquare/>
                            <span>Verified on chain</span>
                        </div>
                        <div className={"flex"}>
                            <AiFillCheckSquare/>
                            <span>From a trusted issuer</span>
                        </div>
                    </>)
                    }
                    <span>All verification logic is running client side within your browser</span>
                    <span>Don't trust us? We understand. <Link
                        to={"https://github.com/JidoTaikaSuru/dili-frontend/README.MD#verifying-attestations"}>Here's instructions on how to verify for yourself</Link></span>
                </DialogContent>
        </Dialog>

    )
}