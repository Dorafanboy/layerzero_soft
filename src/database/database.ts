import fs from 'fs';
import { IState, stateFilePath } from './databaseData';

export function saveData(state: IState) {
    if ('accountIndex' in state && 'remainingModules' in state) {
        fs.writeFileSync(stateFilePath, JSON.stringify({ ...state }, null, 2));
    }
}

export function loadState() {
    if (fs.existsSync(stateFilePath)) {
        const state = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
        return state;
    } else {
        return { index: 0, remainingModules: 0 };
    }
}
