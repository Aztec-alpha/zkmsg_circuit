import React, { useCallback, useContext, useEffect, useState } from "react"

import { useRouter } from "next/router"

import { SelectGroup } from "./SelectGroup"

import { hashMessage } from "utils/mimc"
import { PageContext } from "utils/context"
import { sign } from "utils/client/prove"
import { User } from "utils/types"
import { generateProofZKMSG } from "utils/noir-proof"
// import { derivePublicKey } from "utils/mimc"
// import { derivePublicKey } from "utils/mimc_noir"

interface CreateThreadProps {
	defaultUsers: User[]
}

export const CreateThread: React.FC<CreateThreadProps> = (props) => {
	const { user, secretKey } = useContext(PageContext)

	const [value, setValue] = useState("")
	const [group, setGroup] = useState(user ? [user] : [])

	useEffect(() => {
		if (user === null) {
			setGroup([])
			setValue("")
		}
	}, [user])

	const router = useRouter()
	
	const hexToDec = (hex: string) => BigInt("0x" + hex).toString(10)

	// Noir prove
	const handleSubmit1 = useCallback(async () => {
		if (secretKey === null) { return}
    // const hash = hashMessage(value).toString(16)
		// console.log("...", hexToDec(secretKey), hexToDec(hash), group_)
		
		// console.log("1 hash", derivePublicKey("1") );

		/* 
		const s = "0x01"
		const msg = "1"
		const g = [
			"0x173e7db6826c764253a876c55e0261292a7980c500aa94e66a2387049b578496",
			"0x1b0fabf651bd238445d7a85e1116146423c24f8bdee62a728e5af969da335354",
			"0x2e016308ece21d05fc3ee8a1397537db7ce93aff5f826daf51a7300c543ba673"
		]
		const proof = await generateProofZKMSG(s, msg, g) 
		*/

		const proof = await generateProofZKMSG(secretKey, value, group)

		// const proof = await generateProofZKMSG(1, 2, [1,2,3])
    // const proof = await generateProofZKMSG('1', '2', ['1','3','2'])
    // const proof = await generateProofZKMSG(hexToDec(secretKey), hexToDec(hash), group_)
		

    // const signature = await sign(proof, secretKey)

		router.push("/");
    // router.push({
    //   pathname: "/thread",
    //   query: {
    //     proof,
    //     signature,
    //   },
    // })
	}, [secretKey, value, group, router])

	// groth16 - prove.
	const handleSubmit = useCallback(async () => {
		if (secretKey === null) { return }
		const { proof, publicSignals } = await sign(secretKey, group, value)
		const message = {
			body: value,
			hash: hashMessage(value).toString(16),
			proof,
			publicSignals,
		}
		const res = await fetch("/api/threads", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				group: group.map((user) => user.publicKey),
				firstMessage: message,
			}),
		})

		if (res.status === 200) {
			const location = res.headers.get("Location")
			console.log("location: ", location);
			if (location !== null) {
				router.push(location)
			}
		} else {
			alert("Failed to create thread 😭")
		}
	}, [secretKey, value, group, router])

	return (
		<div>
			<input
				className={
					user
						? "rounded-lg px-4 py-3 flex-1 bg-white"
						: "rounded-lg px-4 py-3 flex-1 bg-white placeholder-light"
				}
				disabled={user === null}
				type="text"
				placeholder={user ? "Type your message here" : "Login to post messages"}
				value={value}
				onChange={(event) => setValue(event.target.value)}
			/>
			<div className="flex my-2 gap-2">
				<div className="flex-1">
					<SelectGroup
						group={group}
						setGroup={setGroup}
						defaultUsers={props.defaultUsers}
					/>
				</div>
				<input
					className={
						user && value
							? "text-white rounded-lg px-4 pt-2 pb-1 cursor-pointer bg-pink hover:bg-midpink"
							: "text-white rounded-lg px-4 pt-2 pb-1 bg-gray-200"
					}
					type="button"
					value="Post"
					disabled={user === null || value === "" || group.length < 2}
					onClick={handleSubmit1}
				/>
			</div>
		</div>
	)
}
