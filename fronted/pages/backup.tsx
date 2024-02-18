import React, { useCallback, useContext, useEffect, useState } from "react"
import type { GetServerSideProps } from "next"

import copy from "copy-text-to-clipboard"

import Link from "next/link"
import { useRouter } from "next/router"

import nookies from "nookies"
import { PageProps } from "utils/types"
import { PageContext } from "utils/context"
// import { derivePublicKey } from "utils/mimc"
import { derivePublicKey } from "utils/mimc_noir"
import { LOCAL_STORAGE_SECRET_KEY } from "utils/client/localStorage"

interface BackupPageProps extends PageProps {}

export const getServerSideProps: GetServerSideProps<
	BackupPageProps,
	{}
> = async (ctx) => {
	const { publicKey } = nookies.get(ctx)

	if (publicKey !== undefined) {
		const user = await prisma.user.findUnique({
			where: { publicKey },
			select: { publicKey: true },
		})

		if (user === null) {
			nookies.destroy(ctx, "publicKey", { path: "/", httpOnly: true })
		} else {
			return { redirect: { destination: "/", permanent: false } }
		}
	}

	return { props: { user: null } }
}

export default function BackupPage(props: BackupPageProps) {

	const router = useRouter()

	const { loading, unverifiedSecretKey, setSecretKey, setUser  } = useContext(PageContext)
	const [copied, setCopied] = useState<boolean>(false)
	const [publicKey, setPublicKey] = useState<string | null>(null)


	useEffect(() => {
		if (unverifiedSecretKey !== null) {
			const publicKey = derivePublicKey(unverifiedSecretKey)
			// console.log("publicKey11", publicKey);
			setPublicKey(publicKey)
		}
	}, [unverifiedSecretKey])


	useEffect(() => {
		if (!loading && unverifiedSecretKey === null) {
			router.push("/login")
		}
	}, [loading, unverifiedSecretKey])

	const handleCopy = useCallback(() => {
		copy(unverifiedSecretKey || "")
		setCopied(true)
	}, [unverifiedSecretKey])


	const createUser = useCallback(async () => {
		if (unverifiedSecretKey === null || publicKey === null) {
			return
		}
    console.log("createUser - publicKey", publicKey.slice(2,))
		const res = await fetch(`/api/users?publicKey=${publicKey.slice(2,)}`, {
			method: "POST",
		})

		if (res.status === 200) {
			const user = await res.json()
			localStorage.setItem(LOCAL_STORAGE_SECRET_KEY, unverifiedSecretKey)
			setSecretKey(unverifiedSecretKey)
			setUser(user)
			router.push("/")
		} else {
			console.log("Error - createUser", res)
			alert("Could not verify user! Did you post the tweet?")
		}
	}, [unverifiedSecretKey, publicKey])

	return (
		<div className="mt-16 max-w-lg m-auto font-mono">
			<div className="m-2 border border-gray-300 rounded-xl p-6">
				<div>
					This is your ZK CHAT login token. Keep it secret and save it somewhere
					safe:
				</div>
				<textarea
					className="block w-full outline-none py-5 px-6 my-6 rounded-xl border focus:border-blue-300 resize-none text-gray-800"
					rows={3}
					readOnly
					value={unverifiedSecretKey || ""}
				/>
				<input
					className="block w-full cursor-pointer bg-gray-300 text-gray-800 rounded-xl px-4 py-2 my-4"
					type="button"
					value={copied ? "Copied!" : "Copy"}
					onClick={handleCopy}
				/>
				{/* <Link href="/connect">
					<a className="block cursor-pointer bg-pink hover:bg-midpink text-white text-center rounded-xl px-4 py-2">
						Next
					</a>
				</Link> */}

				<button
					className={"block w-full cursor-pointer bg-pink hover:bg-midpink text-white rounded-xl px-4 py-2 mt-3"}
					type="button"
					onClick={createUser}
				>
					{"Check"}
				</button>
			</div>
		</div>
	)
}





// import React, { useCallback, useContext, useEffect, useState } from "react"
// import type { GetServerSideProps } from "next"

// import copy from "copy-text-to-clipboard"

// import Link from "next/link"
// import { useRouter } from "next/router"

// import nookies from "nookies"
// import { PageProps } from "utils/types"
// import { PageContext } from "utils/context"

// interface BackupPageProps extends PageProps {}

// export const getServerSideProps: GetServerSideProps<
// 	BackupPageProps,
// 	{}
// > = async (ctx) => {
// 	const { publicKey } = nookies.get(ctx)

// 	if (publicKey !== undefined) {
// 		const user = await prisma.user.findUnique({
// 			where: { publicKey },
// 			select: { publicKey: true },
// 		})

// 		if (user === null) {
// 			nookies.destroy(ctx, "publicKey", { path: "/", httpOnly: true })
// 		} else {
// 			return { redirect: { destination: "/", permanent: false } }
// 		}
// 	}

// 	return { props: { user: null } }
// }

// export default function BackupPage(props: BackupPageProps) {
// 	const router = useRouter()

// 	const { loading, unverifiedSecretKey } = useContext(PageContext)
// 	const [copied, setCopied] = useState<boolean>(false)

// 	useEffect(() => {
// 		if (!loading && unverifiedSecretKey === null) {
// 			router.push("/login")
// 		}
// 	}, [loading, unverifiedSecretKey])

// 	const handleCopy = useCallback(() => {
// 		copy(unverifiedSecretKey || "")
// 		setCopied(true)
// 	}, [unverifiedSecretKey])

// 	return (
// 		<div className="mt-16 max-w-lg m-auto font-mono">
// 			<div className="m-2 border border-gray-300 rounded-xl p-6">
// 				<div>
// 					This is your ZK CHAT login token. Keep it secret and save it somewhere
// 					safe:
// 				</div>
// 				<textarea
// 					className="block w-full outline-none py-5 px-6 my-6 rounded-xl border focus:border-blue-300 resize-none text-gray-800"
// 					rows={3}
// 					readOnly
// 					value={unverifiedSecretKey || ""}
// 				/>
// 				<input
// 					className="block w-full cursor-pointer bg-gray-300 text-gray-800 rounded-xl px-4 py-2 my-4"
// 					type="button"
// 					value={copied ? "Copied!" : "Copy"}
// 					onClick={handleCopy}
// 				/>
// 				<Link href="/connect">
// 					<a className="block cursor-pointer bg-pink hover:bg-midpink text-white text-center rounded-xl px-4 py-2">
// 						Next
// 					</a>
// 				</Link>
// 			</div>
// 		</div>
// 	)
// }
