import { expect } from 'chai';
import * as appRoot from 'app-root-path';

import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
// import circuit from '../circuits/target/zkmsg.json';
import { ProofData } from '@noir-lang/types';
import { compile, PathToFileSourceMap } from '@noir-lang/noir_wasm';
import { join } from 'path';
import { readFileSync } from 'fs';

const getCircuit = async (name: string) => {
    const sourcePath = new URL('circuits/src/main.nr', "file://"+appRoot.toString()+"/");
    const sourceMap = new PathToFileSourceMap();

    sourceMap.add_source_code(sourcePath.pathname, readFileSync(join(sourcePath.pathname), 'utf-8'));
    const compiled = compile(sourcePath.pathname, undefined, undefined, sourceMap);
    return compiled;
};

describe('It generate valid proof for correct input', () => {
    let noir: Noir;
    let correctProof: ProofData;

    before(async () => {
        const compiled = await getCircuit('main');
        // const verifierContract = await hre.viem.deployContract('UltraVerifier');

        // const verifierAddr = verifierContract.address;
        // console.log(`Verifier deployed to ${verifierAddr}`);

        // @ts-ignore
        const backend = new BarretenbergBackend(compiled.program);
        // @ts-ignore
        noir = new Noir(compiled.program, backend);
    });

    it('Should generate valid proof for correct input', async () => {
        const input = {
            secrect: 1, msg: 1, hashes: [
                "0x1b0fabf651bd238445d7a85e1116146423c24f8bdee62a728e5af969da335354",
                "0x2e016308ece21d05fc3ee8a1397537db7ce93aff5f826daf51a7300c543ba673",
                "0x173e7db6826c764253a876c55e0261292a7980c500aa94e66a2387049b578496"
            ]
        }
        // Generate proof
        correctProof = await noir.generateFinalProof(input);
        expect(correctProof.proof instanceof Uint8Array).to.be.true;
    });
})
