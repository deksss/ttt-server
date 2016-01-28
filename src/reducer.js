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
  case 'CREATE_ROOM':
    return createRoom(state, action.clientId);
  case 'JOIN_ROOM':
    return joinRoom(state, action.clientId, action.roomId);
  }
  return state;
}
