import * as t from "io-ts"
import { NextApiRequest, NextApiResponse } from "next"
import { hashMessage } from "utils/mimc"

import { prisma } from "utils/server/prisma"

const postRequestBody = t.type({
	body: t.string,
	hash: t.string,
	proof: t.type({}),
	publicSignals: t.array(t.string),
})

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		console.log("Request method not supported.")
		return res.status(400).end()
	}

	// if (!postRequestBody.is(req.body)) {
	// 	return res.status(401).end()
	// }

	const { body, hash, proof, publicSignals } = req.body

	// if (hashMessage(body).toString(16) !== hash) {
	// 	return res.status(402).end()
	// }

	if (typeof req.query.id !== "string") {
		return res.status(403).end()
	}

	console.log("req.query.id ", req.query.id )
	await prisma.message
		.create({
			data: {
				thread: { connect: { id: req.query.id } },
				isLastMessageOf: { connect: { id: req.query.id } },
				body,
				hash,
				proof,
				publicSignals,
			},
			select: { id: true },
		})
		.then(() => {
			res.status(200).end()
		})
		.catch((err) => {
			console.error("prisma.message Error:", err)
			res.status(500).end()
		})
}
