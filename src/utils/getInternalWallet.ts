import * as dotenv from 'dotenv';
dotenv.config();

export function getInternalWallet(){
    return process.env.PUSH_PROTOCOL_CHANNEL_PRIV_KEY ?? "";
}