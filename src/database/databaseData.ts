import path from 'path';

export const stateFilePath = path.join(__dirname, '../assets/', 'state.json');
export const headersFilePath = path.join(__dirname, '../assets/', 'headers.json');

export interface IState {
    readonly accountIndex: number;
    readonly remainingModules: number;
}
