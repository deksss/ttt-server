import makeStore from './src/store';
import {startServer} from './src/server';

export const store = makeStore();
store.dispatch({type: 'INIT_DATA'});
startServer(store);

