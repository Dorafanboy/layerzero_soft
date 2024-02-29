import { PrivateKeyAccount } from 'viem';
import { L2Telegraph } from '../../config';

export async function l2telegraphBridge(account: PrivateKeyAccount) {
    if (L2Telegraph.isUseRefuel == false) {
        return false;
    }
}

export async function l2telegraphSendMessage(account: PrivateKeyAccount) {
    if (L2Telegraph.isUseSendMessage == false) {
        return false;
    }
}
