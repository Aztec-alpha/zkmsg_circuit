import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { Noir, ProofData, keccak256 } from "@noir-lang/noir_js";
import { CompiledCircuit } from "@noir-lang/types";
import { zkmsg } from "./artifacts";
// import { zkmsg_simple } from "./artifacts";
import { ethers } from "ethers";
import { parseUint8ArrayToStrArray } from "./helper";
import { derivePublicKey } from "./mimc_noir";
import { derivePublicKey as derivePublicKeyRaw } from "./mimc";
import { User } from "utils/types"

// hashedAddress: string,
// pubkey: Uint8Array,
// signature: Uint8Array,
// msgHash: Uint8Array

export async function generateProofZKMSG(
  secrect: string|number,
  msg: string,
  group: User[],
): Promise<ProofData | undefined>{ // |undefined
  const program = zkmsg as CompiledCircuit
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);
  await noir.init()

  // ethers.getBytes(pubkey)  -> Uint8

	// const pubkeyBytes32Array = await parseUint8ArrayToStrArray(pubkey);
	// console.log("pubkeyBytes32Array: ", pubkeyBytes32Array);

	// const signatureBytes32Array = await parseUint8ArrayToStrArray(signature);
	// console.log("signatureBytes32Array: ", signatureBytes32Array);

	// const msgHashBytes32Array = await parseUint8ArrayToStrArray(msgHash);
	// console.log("msgHashBytes32Array: ", msgHashBytes32Array);



  /* 2 个 Mimc 函数在 hash 数字的时候是等价的....
	console.log("derivePublicKey of 1,2,3", 
	   derivePublicKey("1"), 
	   derivePublicKey("2"), 
		 derivePublicKey("3"),
	);
	console.log("derivePublicKeyRaw ", 
	   derivePublicKey("1"),
		 derivePublicKey("2"), 
		 derivePublicKey("3"),
	);
	
	// Prove 成功.
	const input = {
		secrect: "2", // 1, //"0x01",
		msg: "1",
		hashes: [
			"0x1b0fabf651bd238445d7a85e1116146423c24f8bdee62a728e5af969da335354", // 数字 1 的哈希值
			"0x2e016308ece21d05fc3ee8a1397537db7ce93aff5f826daf51a7300c543ba673", // 数字 2 的哈希值
			"0x173e7db6826c764253a876c55e0261292a7980c500aa94e66a2387049b578496", // 数字 3 的哈希值
		]
	} */

  // const countWitness = await generateW(countCircuit, countInput);

	// const s1 = "5062f2205cabb78baa1d8f18626ade36"
	// const s2 = "f2558d247d05e6a20cdf1e8a6d9e634c"
	// console.log("derivePublicKey", 
	//   derivePublicKey(s1),
	//   derivePublicKey(s2)
	// );
	// console.log("derivePublicKey-Raw", 
	//   derivePublicKeyRaw(s1),
	//   derivePublicKeyRaw(s2)
	// )

		
  /* Prove success!!!!
		secrect = "5"
	 const input = {
		secrect: "0x" + secrect, // Exceeded Field.
		msg,
    // hashes: group.map((user) => "0x" + user.publicKey)
		hashes: [
			derivePublicKey(secrect as string),
			"0x1b0fabf651bd238445d7a85e1116146423c24f8bdee62a728e5af969da335354", // 数字 1 的哈希值
			"0x2e016308ece21d05fc3ee8a1397537db7ce93aff5f826daf51a7300c543ba673", // 数字 2 的哈希值
		]
	};
	*/
	// console.log("Derive secrect", derivePublicKey(secrect as string))
	// console.log("groups", group.map((user) => "0x" + user.publicKey))
  console.log("msg", msg)
	const input = {
		secrect: "0x" + secrect,
		msg: "0x" + msg,
		hashes: group.map((user) => "0x" + user.publicKey)
	}

	console.log("(private & public) input: ", input);

	try {
		const proof = await noir.generateFinalProof(input);
		console.log("proof: ", proof);
		console.log("proof.publicInputs: ", proof.publicInputs);

    const res = await noir.verifyFinalProof(proof);
    console.log("verify res..", res)

		return proof;

	} catch (e) {
		console.log("proof generation failed: ", e);
		// return await noir.generateFinalProof(input)
	}
	// const result = await noir.verifyProof(proof);
	// console.log("result: ", result);
}

export async function verifyProofZKMSG(
  proof: ProofData,
): Promise<boolean> { // |undefined
  const program = zkmsg as CompiledCircuit
	const backend = new BarretenbergBackend(program);
	const noir = new Noir(program, backend);
	await noir.init()

	try {
		const res = await noir.verifyFinalProof(proof);
		console.log("Verify res..", res)
		return res
	} catch (e) {
		console.log("proof generation failed: ", e);
		return false
	}
}