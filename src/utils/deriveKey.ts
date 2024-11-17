import * as dotenv from 'dotenv';
import {TappdClient} from '@phala/dstack-sdk'
import { privateKeyToAccount } from 'viem/accounts'
import {keccak256} from "viem";
import 'dotenv/config'
import { ethers } from 'ethers';

dotenv.config();

export const dynamic = 'force-dynamic'
const endpoint = process.env.DSTACK_SIMULATOR_ENDPOINT || 'http://localhost:8090'
const TEE_Wallet = ethers.Wallet.createRandom();

export function getTEEPrivKey(){
    return TEE_Wallet.privateKey;
}

export function getTEEPublicKey(){
    return TEE_Wallet.address;
}