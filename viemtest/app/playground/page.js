"use client";

import { ViemUtils, ViemContract } from '../utils/viem';
import { useState, useEffect } from 'react'
const simpleStorageABI = require('./simplestorageabi.json');
import { decodeEventLog, parseAbi, parseEther } from 'viem'


let storageContract = null;


const Playground = () => {

    const [loading, setLoading] = useState(false);


    const initialize = async () => {
        //Regiuster Viemutils
        ViemUtils.registerWalletClient(window);
        const address = await ViemUtils.getConnectedAddress();
        console.log(`Connected Address: ${address}`);
        storageContract = new ViemContract({
            name: 'SimpleStorage',
            abi: simpleStorageABI.abi,
            address: '0xe373adf3eda57082ad8b94d009514bccfee6a825',
        });
    }

    const testSendTX = async () => {
        setLoading(true);
        const txdata = await ViemUtils.sendTransaction({
            to: '0xd676B6EA169226319127FffEA974E13e74f8052e',
            valueInEth: '0.001'
        });
        setLoading(false);
    }

    const load = async () => {
        if (storageContract === null) return console.error('NULLCONTRACT');
        setLoading(true);
        const res = await storageContract.read({
            functionName: 'get'
        });
        setLoading(false);
        alert(`Data: ${res}`);
    }

    const store = async () => {
        if (storageContract === null) return console.error('NULLCONTRACT');
        setLoading(true);
        const res = await storageContract.write({
            functionName: 'set',
            args: [443],
        });
        setLoading(false);
        console.log(res);
    }

    const listen = async () => {
        if (storageContract === null) return console.error('NULLCONTRACT');
        await storageContract.listenToEvent({
            eventDefinition: 'event ValueUpdated(uint256 newValue)',
            callback: (data) => {
                console.log(`===ValueUpdated EVENT===`);
                console.info(data);
            }
        })
        await storageContract.listenToEvent({
            eventDefinition: 'event Deposit(address indexed depositor, uint256 amount)',
            callback: (data) => {
                console.log(`===Deposit EVENT===`);
                console.info(data);
            }
        })
    }

    const deploy = async () => {
        if (storageContract === null) return console.error('NULLCONTRACT');
        setLoading(true);
        const res = await ViemUtils.deployContract({ abi: simpleStorageABI.abi });
        setLoading(false);
        console.log(res);
    }


    const pay = async () => {
        if (storageContract === null) return console.error('NULLCONTRACT');
        setLoading(true);
        const res = await storageContract.write({
            functionName: 'deposit',
            value: parseEther('0.001'),
        });
        setLoading(false);
        console.log(res);
    }

    const checkBalance = async () => {

        if (storageContract === null) return console.error('NULLCONTRACT');
        setLoading(true);
        const res = await storageContract.read({
            functionName: 'checkBalance'
        });
        setLoading(false);
        alert(`Balance: ${Number(res) / 10 ** 18} ETH`);
    }

    useEffect(() => {
        console.log('Loaded');
        initialize();
    }, []);


    if (loading) {
        return <h1 className="text-lg">Loading</h1>
    }

    return (
        <div className='text-sky-400 p-5'>
            <p className='text-4xl'>SimpleStorage</p>
            <br /><br />
            <button onClick={deploy} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Test Deploy </button><br />

            <button onClick={testSendTX} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Send Transaction Test </button><br />

            <button onClick={load} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Load </button><br />

            <button onClick={store} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Store </button><br />

            <button onClick={listen} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Listen </button><br />

            <button onClick={pay} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Test Deposit </button><br />

            <button onClick={checkBalance} className="ml-5 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"> Check Balance </button><br />

        </div>
    );
}

export default Playground;