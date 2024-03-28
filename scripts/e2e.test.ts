import { createAccount, getDeployedTestAccountsWallets } from '@aztec/accounts/testing';
import {
  AccountWallet,
  CheatCodes,
  ExtendedNote,
  Fr,
  Note,
  PXE,
  TxStatus,
  computeMessageSecretHash,
  createPXEClient,
  waitForPXE,
} from '@aztec/aztec.js';
import { TestContract } from '@aztec/noir-contracts.js/Test';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

import { U128_UNDERFLOW_ERROR } from './fixtures/fixtures.js';

const { PXE_URL = 'http://localhost:8080', ETHEREUM_HOST = 'http://localhost:8545' } = process.env;

describe('guides/dapp/testing', () => {
  describe('on local sandbox', () => {
    beforeAll(async () => {
      const pxe = createPXEClient(PXE_URL);
      await waitForPXE(pxe);
    });

    describe('assertions', () => {
      let pxe: PXE;
      let owner: AccountWallet;
      let recipient: AccountWallet;
      let testContract: TestContract;
      let token: TokenContract;
      let cheats: CheatCodes;
      let ownerSlot: Fr;

      beforeAll(async () => {
        pxe = createPXEClient(PXE_URL);
        owner = await createAccount(pxe);
        recipient = await createAccount(pxe);
        testContract = await TestContract.deploy(owner).send().deployed();
        token = await TokenContract.deploy(owner, owner.getCompleteAddress(), 'TokenName', 'TokenSymbol', 18)
          .send()
          .deployed();

        const ownerAddress = owner.getAddress();
        const mintAmount = 100n;
        const secret = Fr.random();
        const secretHash = computeMessageSecretHash(secret);
        const receipt = await token.methods.mint_private(100n, secretHash).send().wait();

        const storageSlot = new Fr(5);
        const noteTypeId = new Fr(84114971101151129711410111011678111116101n); // TransparentNote

        const note = new Note([new Fr(mintAmount), secretHash]);
        const extendedNote = new ExtendedNote(
          note,
          ownerAddress,
          token.address,
          storageSlot,
          noteTypeId,
          receipt.txHash,
        );
        await pxe.addNote(extendedNote);

        await token.methods.redeem_shield(ownerAddress, 100n, secret).send().wait();

        // docs:start:calc-slot
        cheats = CheatCodes.create(ETHEREUM_HOST, pxe);
        // The balances mapping is defined on storage slot 3 and is indexed by user address
        ownerSlot = cheats.aztec.computeSlotInMap(3n, ownerAddress);
        // docs:end:calc-slot
      }, 90_000);

      it('checks private storage', async () => {
        // docs:start:private-storage
        const notes = await pxe.getNotes({
          owner: owner.getAddress(),
          contractAddress: token.address,
          storageSlot: ownerSlot,
        });
        const values = notes.map(note => note.note.items[0]);
        const balance = values.reduce((sum, current) => sum + current.toBigInt(), 0n);
        expect(balance).toEqual(100n);
        // docs:end:private-storage
      }, 30_000);

    });
  });
});