import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

const coin = function () {
  return Math.random() > 0.5;
}

export function nextTurn(state, roomId) {
  const curPlayer = state.get(roomId).get('curPlayer') || '';
  const p1 = state.get(roomId).get('players').get(0).get('name') || 'P1';
  const p2 = state.get(roomId).get('players').get(1).get('name') || 'P2';

  if ((!curPlayer && coin()) || curPlayer === p2) {
    return state.setIn([roomId, 'curPlayer'], p1);
  }
  else  {
    return state.setIn([roomId, 'curPlayer'], p2);
  }
}

export function restart(state) {
  return state;
}

export function playerStart(state, roomId, playerId) {
  console.log(playerId + ', room:' + roomId);
  console.log(state);
  var players = state.get(roomId).get('players');
  console.log('plrs:' + players);
  var newState;
  var allReady;

  if (players.get(0).get('id') === playerId) {
    newState = state.setIn([roomId, 'players', 0, 'ready'], true);
  } else if (players.get(0).get('id') === playerId) {
    newState = state.setIn([roomId, 'players', 1, 'ready'], true);
  } else {
    newState = state;
  }
  // here must be the error
  allReady = newState.get(roomId).get('players').get(0).get('ready') +
             newState.get(roomId).get('players').get(1).get('ready');

  if (allReady) {
    return startGame(newState, roomId);
  } else {
    return newState;
  }
}

export function startGame(state, roomId) {
  return state.setIn([roomId, 'ready'], true);
}

export function createRoom(state, roomId, playerId) {
  console.log('p id: on create ' + playerId);
  const p1 = Map({id: playerId, name: 'P1', ready: false});
  const p2 = Map({id: '', name: 'P2', ready: false});
  const newRoom = Map({players: List([p1, p2]), ready: false, curPlayer: ''});
  return state.set(roomId, newRoom);
}

export function joinRoom(state, roomId, playerId) {
  console.log('p1 join room (fn) ' + playerId);
  if (!state.get(roomId).get('players').get(1).id) {
    return state.setIn([roomId, 'players', 1, 'id'], playerId);
  } else {
    return state;
  }
}
