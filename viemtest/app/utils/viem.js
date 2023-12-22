"use client";

import { createWalletClient, custom, createPublicClient, http } from 'viem'
import { goerli } from 'viem/chains'
import { parseEther, getAddress, decodeEventLog, parseAbi } from 'viem';
import bytecode from '../playground/bytecode';

let eventUnsubscriberList = [];

class ViemUtils {

    static walletClient = null;
    static publicClient = null;
    static initialized = false;
    static chain = goerli;

    static registerWalletClient = (windowObject) => {
        this.walletClient = createWalletClient({
            chain: this.chain,
            transport: custom(windowObject.ethereum)
        });
        this.publicClient = createPublicClient({
            chain: this.chain,
            transport: http()
        });
        this.initialized = true;
        console.log('walletclient registered with window');
    }

    static getConnectedAddress = async () => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        const [addr] = await this.walletClient.getAddresses();
        return getAddress(addr);
    }

    static sendTransaction = async ({ from, to, valueInEth }) => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        if (from === undefined) {
            from = await this.getConnectedAddress();
            console.log(`sendTransaction: 'from' address automatically set to: ${from}`)
        }
        const hash = await this.walletClient.sendTransaction({
            account: from,
            to: to,
            value: parseEther(valueInEth)
        })
        console.log(`TXHash: ${hash}`);

        const txdata = await this.publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(txdata);
        return txdata;
    }

    static getBalanceInWei = async (addr) => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        return await this.publicClient.getBalance({
            address: addr
        });
    }

    static signMessage = async (message) => {
        const account = await this.getConnectedAddress();
        const signature = await walletClient.signMessage({
            account,
            message: message,
        });
        return signature;
    }

    static handleWalletClientUninitializedCase() {
        console.error('WalletClient uninitialized!!!!');
    }

    static deployContract = async ({
        abi,
    }) => {
        if (!this.initialized) return this.handleWalletClientUninitializedCase();
        const account = await this.getConnectedAddress();
        console.log(abi);
        console.log(account);
        console.log(bytecode);
        const hash = await this.walletClient.deployContract({
            abi: abi,
            account: account,
            bytecode: bytecode,
            args: [10],
            gas: 500000,
        })
        console.log(`TXHash: ${hash}`);
        const txdata = await this.publicClient.waitForTransactionReceipt({ hash: hash });
        console.log(txdata);
    }
}




class ViemContract {
    contractName = null;
    contractABI = null;
    contractAddress = null;
    initialized = false;

    constructor({ name, abi, address }) {
        if (!ViemUtils.initialized) throw new Error('ViemUtils uninitialized!');
        this.contractABI = abi;
        this.contractAddress = address;
        this.contractName = name;
        this.initialized = true;
        console.log(`ViemContract(${this.contractName}) initialized!`);
    }

    write = async ({ functionName, args = [], value }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const account = await ViemUtils.getConnectedAddress();
        const { request } = await ViemUtils.publicClient.simulateContract({
            account,
            address: this.contractAddress,
            abi: this.contractABI,
            args: [...args],
            value: value,
            functionName: functionName,
        })
        const hash = await ViemUtils.walletClient.writeContract(request);
        const txdata = await ViemUtils.publicClient.waitForTransactionReceipt({ hash: hash });
        return txdata;
    }

    read = async ({ functionName, args = [] }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const data = await ViemUtils.publicClient.readContract({
            address: this.contractAddress,
            abi: this.contractABI,
            functionName: functionName,
            args: [...args]
        });
        return data;
    }


    listenToEvent = ({ eventDefinition, indexedArguments, callback }) => {
        if (!this.initialized) return handleUninitializedContract();
        const eventName = eventDefinition.substring(6, eventDefinition.indexOf('('));
        const unwatch = ViemUtils.publicClient.watchContractEvent({
            address: this.contractAddress,
            abi: this.contractABI,
            eventName: eventName,
            args: indexedArguments !== undefined ? { ...indexedArguments } : undefined,
            onLogs: logs => {
                const parsedData = decodeEventLog({
                    abi: parseAbi([eventDefinition]),
                    data: logs[0].data,
                    topics: logs[0].topics,
                    strict: false
                });
                callback(parsedData);
            }
        });
        eventUnsubscriberList.push({
            contract: this.contractName,
            dispose: unwatch,
        });
        console.log(`Started Listening to ${eventName} event`);
    }


    getEventLog = async ({ eventName }) => {
        if (!ViemUtils.initialized) return handleUnitializedUtils();
        if (!this.initialized) return handleUninitializedContract();
        const logs = await ViemUtils.publicClient.getContractEvents({
            abi: this.contractABI,
            address: this.contractAddress,
            eventName: eventName,
        });
        console.log(`Received Logs => ${logs}`);
        return logs;
    }


    stopListeningToEvents = async () => {
        const remlist = eventUnsubscriberList.filter((x) => x.contract !== this.contractName);
        const evlist = eventUnsubscriberList.filter((x) => x.contract === this.contractName);
        for (let ev of evlist) {
            await ev.dispose();
        }
        eventUnsubscriberList = [...remlist];
    }


    handleUninitializedContract() {
        throw new Error('ViemContract uninitialized!!!!');
    }

    handleUnitializedUtils() {
        throw new Error('ViemUtils uninitialized!!!!');
    }
}




export { ViemUtils, ViemContract };