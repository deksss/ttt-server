import {List, Map} from 'immutable';

export const INITIAL_STATE = Map();

export function setPlayers(state, players) {
  const list = List(players);
  return state.set('players', list)
              .set('initialPlayers', list);
}


const coin = function () {
  return Math.random() > 0.5;
}

export function nextTurn(state) {
  var curPlayer = state.get('curPlayer') || '';
  const p1 = state.get('players').get(0).name || 'p1';
  const p2 = state.get('players').get(1).name || 'p2';

  if (!curPlayer) {
    if (coin()) {
      return state.set('curPlayer', p1);
    }
    else {
      return state.set('curPlayer', p2)
    }
  }
  else if (curPlayer === p1) {
    return state.set('curPlayer', p2);
  }
  else {
    return state.set('curPlayer', p1);
  }
}

export function restart(state) {
  return state;
}

export function playerStart(state, playerId) {
  var players = state.get('players').toArray();
  for (var i = 0; i < players.length; i++) {
    if( players[i].id === '' ) {
      players[i].id = playerId;
      players[i].ready = true;
      break;
    } else if (players[i].id === playerId) {
      break;
    }
  }
    return setReady(state.merge(
      Map({'players' : List(players)})), playerId);
}

export function setReady(state, playerId) {
  let ready = true;
  var players = state.get('players').toArray();
  for (var i = 0; i < players.length; i++) {
    if(players[i].ready === false) {
      ready = false;
      break;
    }
  }
  return state.merge(
      Map({'ready' : ready}));
}
