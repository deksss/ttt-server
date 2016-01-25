import {setPlayers, nextTurn, restart, INITIAL_STATE, playerStart, setReady} from './core';

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'SET_PLAYERS':
    return setPlayers(state, action.players);
  case 'NEXT_TURN':
    return nextTurn(state);
  case 'RESTART':
    return restart(state);
  case 'PLAYER_START':
    return playerStart(state, action.clientId);
  case 'PLAYER_READY':
    return setReady(state, action.clientId);
  }
  return state;
}
