import { lastValueFrom } from 'rxjs';

export async function delay(sec: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, sec * 1000);
    });
}

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export async function wrapObservableToPromise(func, ...args) {
    try {
        return await lastValueFrom(func(...args));
    } catch (e) {
        return e;
    }
}
