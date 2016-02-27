import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

export function createRoom(state, roomId, playerId, name) {
  const p1 = Map({id: playerId, name: 'P1', playerName: name, ready: false});
  const p2 = Map({id: '', name: 'P2', playerName: 'P2', ready: false});
  const newRoom = Map({players: List([p1, p2]),
                       ready: false,
                       curPlayer: '',
                       deckList: state.get('deckList')});
  return state.set(roomId, newRoom)
              .set('rooms', state.get('rooms').push(roomId));
}

export function joinRoom(state, roomId, playerId, name) {
  if (!state.get(roomId).get('players').get(1).id) {
    return state.setIn([roomId, 'players', 1, 'id'], playerId)
                .setIn([roomId, 'players', 1, 'playerName'], name)
                .set('rooms', state.get('rooms').filter(room => room !== roomId));
  } else {
    return state;
  }
}
