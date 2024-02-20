import React, { useCallback, useState } from "react"
import { verifyMessage } from "utils/client/prove"
import { Message, Thread, User, VKeys } from "utils/types"
import { UserIcon } from "./UserIcon"
import { verifyProofZKMSG } from "utils/noir-proof"
import { ProofData } from "@noir-lang/types"
import { deserializeProofData } from "utils/helper"

interface ThreadViewProps {
	vKeys: VKeys
	thread: Thread & {
		firstMessage: Message
		messageCount: number
		group: User[]
	}
}

function replyCountText(messageCount: number) {
	if (messageCount === 2) {
		return "1 reply"
	} else {
		return `${messageCount - 1} replies`
	}
}

export function ThreadView(props: ThreadViewProps) {
	const [verified, setVerified] = useState<null | boolean>(null)

	const handleVerifyGroth16 = useCallback(async () => {
		const verified = await verifyMessage(props.vKeys, props.thread.firstMessage)
		setVerified(verified)
	}, [])

	// const handleVerifyNoir = useCallback(async () => {
	// 	const verified = await verifyProofZKMSG(props.thread. as ProofData)
	// 	setVerified(verified)
	// }, [])

	const handleVerifyNoir = useCallback(async () => {
		console.log("handleVerifyNoir..")
		// console.log("props.message.proof", props.message.proof)
		console.log("Verify message JSON.parse..", deserializeProofData(props.thread.firstMessage.proof ))
		const verified = await verifyProofZKMSG(deserializeProofData(props.thread.firstMessage.proof) as ProofData)
		setVerified(verified)
	}, [])

	return (
		<div className="px-4 pt-4 pb-2 bg-white rounded-lg">
			<div>{props.thread.firstMessage.body}</div>
			<div className="flex gap-1 items-center my-2">
				<div className="flex gap-1 flex-1">
					{props.thread.group.map((user, i) => (
						<UserIcon key={i} user={user} />
					))}
				</div>
				<div className="flex gap-2 items-baseline">
					<a
						className="text-sm cursor-pointer hover:underline"
						href={`/thread/${props.thread.id}`}
					>
						{replyCountText(props.thread.messageCount)}
					</a>
					<button
						className={
							verified === null
								? "pt-1 pb-0.5 px-2 rounded text-sm bg-gray-100"
								: verified === true
								? "pt-1 pb-0.5 px-2 rounded text-sm bg-green-100 cursor-default"
								: "pt-1 pb-0.5 px-2 rounded text-sm bg-red-100 cursor-default"
						}
						disabled={verified !== null}
						onClick={handleVerifyNoir}
					>
						{verified === null
							? "Verify"
							: verified === true
							? "Valid ✅"
							: "Invalid 🚨"}
					</button>
				</div>
			</div>
		</div>
	)
}
