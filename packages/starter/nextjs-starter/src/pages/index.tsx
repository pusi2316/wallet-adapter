import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { NextPage } from 'next';
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css';
import {
	AnchorProvider, BN, Program, utils, web3
} from '@project-serum/anchor';
import {  Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {useAnchorWallet } from '@solana/wallet-adapter-react';
const idl = require('../public/idl.json');
const utf8 = utils.bytes.utf8

const Home: NextPage = () => {
    const anchorWallet = useAnchorWallet();
    const [contractBalance, setContractBalance] = useState(0);
    const [reward, setReward] = useState(0);

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
                [utf8.encode('contractbalance'), program.programId.toBuffer()],
                program.programId,
            );
            
            const [devAccountPda] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('devaccount'), program.programId.toBuffer()],
                program.programId,
            );

            console.log("balancePda", balancePda);

            const trans = await program.methods.initialize().accounts({
                contractBalance: balancePda,
                devUser: devAccountPda,
                user: anchorWallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
            })
            .rpc();

            // trans.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            // trans.feePayer = anchorWallet.publicKey;

            // anchorWallet.signTransaction(trans);

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
            const [balancePda] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('contractbalance'), program.programId.toBuffer()],
                program.programId,
            );
            
            //const lastDeposit =  web3.Keypair.generate();
            const [lastDeposit] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('lastdeposit'), anchorWallet.publicKey.toBuffer()],
                program.programId,
            );

            const [devAccountPda] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('devaccount'), program.programId.toBuffer()],
                program.programId,
            );

            let hasLastDeposit;
            let asd;
            const fetchedLastDeposit = await program.account.lastDeposit
                .fetch(lastDeposit)
                .then((response) => { 
                    hasLastDeposit = true;
                    console.log("Beléptem geci.");
                    console.log("LastDeposit amount", response.amount.toNumber());
                    asd = response;
                })
                .catch(error => {
                    hasLastDeposit = false;
                    console.log('There was an error!', error);
                });

            let userBalance = await provider.connection.getBalance(anchorWallet.publicKey);
            console.log("UserBalance {userBalance}", userBalance / LAMPORTS_PER_SOL);
            console.log(hasLastDeposit);
            if (!hasLastDeposit) {
                console.log("Creating last deposit.")
                await program.methods.initializeLastDeposit().accounts({
                    lastDeposit: lastDeposit,
                    user: anchorWallet.publicKey,
                    systemProgram: web3.SystemProgram.programId, 
                })
                .rpc();
            }

            console.log("Last Deposit Account: ", lastDeposit);
            
            const trans = await program.methods.transfer(new BN(2000000), anchorWallet.publicKey).accounts({
                contractBalance: balancePda,
                lastDeposit: lastDeposit,
                devUser: devAccountPda,
                user: anchorWallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
              })
                .rpc();

            // trans.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            // trans.feePayer = anchorWallet.publicKey;

            // anchorWallet.signTransaction(trans);
            
            let balance = await provider.connection.getBalance(balancePda);

            console.log("trans", trans);
            
            console.log("Balance on the PDA, ", balance / LAMPORTS_PER_SOL);
            setContractBalance(balance / LAMPORTS_PER_SOL);

            const pda = await program.account.contractBalance.fetch(balancePda);
            console.log("BalancePda: ", pda);

            userBalance = await provider.connection.getBalance(anchorWallet.publicKey);
            console.log("UserBalance {userBalance}", userBalance / LAMPORTS_PER_SOL);
        } catch (err) {
            console.log(err);
        }
    }


    async function WithdrawSol() {
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
            const [balancePda] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('contractbalance'), program.programId.toBuffer()],
                program.programId,
            );
            
            const [lastDeposit] = await web3.PublicKey.findProgramAddress(
                [utf8.encode('lastdeposit'), anchorWallet.publicKey.toBuffer()],
                program.programId,
            );

            // let hasLastDeposit;
            // let asd;
            // const fetchedLastDeposit = await program.account.lastDeposit
            //     .fetch(lastDeposit)
            //     .then((response) => { 
            //         hasLastDeposit = true;
            //         console.log("Beléptem geci.");
            //         console.log("LastDeposit amount", response.amount.toNumber());
            //         asd = response;
            //     })
            //     .catch(error => {
            //         hasLastDeposit = false;
            //         console.log('There was an error!', error);
            //     });

            // let userBalance = await provider.connection.getBalance(anchorWallet.publicKey);
            // console.log("UserBalance {userBalance}", userBalance / LAMPORTS_PER_SOL);
            // console.log(hasLastDeposit);
            // if (!hasLastDeposit) {
            //     console.log("Creating last deposit.")
            //     await program.methods.initializeLastDeposit().accounts({
            //         lastDeposit: lastDeposit,
            //         user: anchorWallet.publicKey,
            //         systemProgram: web3.SystemProgram.programId, 
            //     })
            //     .rpc();
            // }
            let userBalance = await provider.connection.getBalance(anchorWallet.publicKey);
            
            const trans = await program.methods.withdraw(new BN(2000000)).accounts({
                contractBalance: balancePda,
                lastDeposit: lastDeposit,
                user: anchorWallet.publicKey,
                systemProgram: web3.SystemProgram.programId,
              })
                .rpc();

            // trans.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            // trans.feePayer = anchorWallet.publicKey;

            // anchorWallet.signTransaction(trans);
            
            let balance = await provider.connection.getBalance(balancePda);

            console.log("trans", trans);
            
            console.log("Balance on the PDA, ", balance / LAMPORTS_PER_SOL);

            const pda = await program.account.contractBalance.fetch(balancePda);
            console.log("BalancePda: ", pda);

            userBalance = await provider.connection.getBalance(anchorWallet.publicKey);
            console.log("UserBalance {userBalance}", userBalance / LAMPORTS_PER_SOL);
            setContractBalance(balance / LAMPORTS_PER_SOL);
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
                <div>Contract Balance: { contractBalance } SOL</div>
                <div>Reward: { reward } SOL</div>
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
                <p>
                <button onClick={WithdrawSol}>Draw a with.</button>
                </p>
            </main>
        </div>
    );
};

export default Home;