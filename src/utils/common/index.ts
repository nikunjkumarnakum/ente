import { getData, LS_KEYS, setData } from 'utils/storage/localStorage';
import { errorCodes } from './errorUtil';

export function checkConnectivity() {
    if (navigator.onLine) {
        return true;
    } else {
        throw new Error(errorCodes.ERR_NO_INTERNET_CONNECTION);
    }
}

export function getFileExtension(fileName): string {
    return fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
}

export function runningInBrowser() {
    return typeof window !== 'undefined';
}

export function downloadAsFile(key: string) {
    console.log('recovery key downloaded');
}
