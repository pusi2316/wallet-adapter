import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import styles from '../styles/Home.module.css';
import {
	AnchorProvider, BN, Program, utils, web3
} from '@project-serum/anchor';
import {  Connection, PublicKey } from '@solana/web3.js';
import {useAnchorWallet } from '@solana/wallet-adapter-react';
const idl = require('../public/idl.json');
const utf8 = utils.bytes.utf8

const Home: NextPage = () => {
    const anchorWallet = useAnchorWallet();

    async function sendTransaction() {
        if (!anchorWallet) {
            return;
        }
        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");
        const provider = new AnchorProvider(
          connection, anchorWallet, {"preflightCommitment": "processed"},
        );

        console.log(idl);
        const program = new Program(idl, idl.metadata.address, provider);

        try {
            
            const [balancePda] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('contractbalance'), anchorWallet.publicKey.toBuffer()],
                program.programId,
            );

            console.log("balancePda", balancePda);

            const trans = await program.methods.initialize().accounts({
                contractBalance: balancePda,
                user: anchorWallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .transaction();

            trans.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            trans.feePayer = anchorWallet.publicKey;

            anchorWallet.signTransaction(trans);

            console.log("trans", trans);

            const pda = await program.account.contractBalance.fetch(balancePda);
            console.log("fetchedPda: ", pda);
        } catch (err) {
            console.log(err);
        }
    }

    async function DepositSol() {
        if (!anchorWallet) {
            return;
        }
        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");
        const provider = new AnchorProvider(
          connection, anchorWallet, {"preflightCommitment": "processed"},
        );
        const program = new Program(idl, idl.metadata.address, provider);
        
        try {
            const [balancePda] = await PublicKey.findProgramAddress(
                [utf8.encode('contractbalance'), anchorWallet.publicKey.toBuffer()],
                program.programId,
            );
            
            const lastDeposit =  web3.Keypair.generate();
            
            await program.methods.initializeLastDeposit().accounts({
                lastDeposit: lastDeposit.publicKey,
                user: anchorWallet.publicKey,
                systeProgram: web3.SystemProgram.programId, 
            })
            .signers([lastDeposit])
            .rpc();
            
console.log("Last Deposit Account: ", lastDeposit);
            
            const trans = await program.methods.transfer(new BN(20000), anchorWallet.publicKey).accounts({
                contractBalance: balancePda,
                lastDeposit: lastDeposit.publicKey,
                user: anchorWallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
              })
                .transaction();

            trans.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            trans.feePayer = anchorWallet.publicKey;

            anchorWallet.signTransaction(trans);
            
            let balance = await provider.connection.getBalance(balancePda);

            console.log("trans", trans);
            
            console.log("Balance on the PDA, ", balance);

            const pda = await program.account.contractBalance.fetch(balancePda);
            console.log("BalancePda: ", pda);
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.title}>
                    Welcome to <a href="https://nextjs.org">Next.js!</a>
                </h1>

                <div className={styles.walletButtons}>
                    <WalletMultiButton />
                    <WalletDisconnectButton />
                </div>

                <p className={styles.description}>
                    <button onClick={sendTransaction}>Init PDA</button>
                </p>
                <p>
                <button onClick={DepositSol}>Make a Deposition</button>
                </p>
            </main>
        </div>
    );
};

export default Home;