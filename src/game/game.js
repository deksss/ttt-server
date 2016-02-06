import {List, Map} from 'immutable';
import {getUnitById, initUnits} from './units';


export function initData(state) {
  const UNIT_SRC = require('./units-list.json') || [];
  const GAME_FIELD = [['empty', 'empty', 'empty'],
                          ['empty', 'empty', 'empty'],
                          ['empty', 'empty', 'empty']];
  const DECK = List([]);
  const HAND = Map({'1':'', '2':'', '3':'', '4':'', '5':''});
  const UNITS = initUnits(UNIT_SRC);

  return state.set('initField', GAME_FIELD)
              .set('initHand', HAND)
              .set('initDeck', DECK)
              .set('units', UNITS);
}

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

export function tryStart(state, roomId) {
  const players = state.get(roomId).get('players');
  if (players.get(0).get('ready') && players.get(1).get('ready')) {
    return startGame(state, roomId);
  } else {
    return state;
  }
}

export function playerStart(state, roomId, playerId) {
  const players = state.get(roomId).get('players');
  if (players.get(0).get('id') === playerId) {
    return tryStart(state.setIn([roomId, 'players', 0, 'ready'], true), roomId);
  } else if (players.get(1).get('id') === playerId) {
    return tryStart(state.setIn([roomId, 'players', 1, 'ready'], true), roomId);
  } else {
    return tryStart(state, roomId);
  }
}

export function startGame(state, roomId) {

  return state.setIn([roomId, 'ready'], true).setIn([roomId, 'players', 0, 'deck'], );
}


export function generateFieldAnimation () {

}

export function calcDmg () {

}




export function setCard () {

}

export function selectCard () {

}
