import makeStore from './src/store';
import {startServer} from './src/server';

export const store = makeStore();
startServer(store);

store.dispatch({
  type: 'SET_PLAYERS',
  players: require('./players.json')
});

store.dispatch({type: 'NEXT_TURN'});
console.log(store.getState().toJS().curPlayer);
