import {nextTurn, restart, INITIAL_STATE, 
       playerStart, starGame, createRoom, joinRoom} from './core';

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
  case 'NEXT_TURN':
    return nextTurn(state, action.roomId);
  case 'RESTART':
    return restart(state, action.roomId);
  case 'PLAYER_START':
    return playerStart(state, action.roomId, action.clientId);
  case 'START_GAME':
    return setReady(state, action.roomId, action.clientId);
  case 'CREATE_ROOM':
    return createRoom(state, action.roomId, action.playerId);
  case 'JOIN_ROOM':
    return joinRoom(state, action.roomId, action.playerId);
  }
  return state;
}
