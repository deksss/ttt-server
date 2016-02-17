import {List, Map} from 'immutable';
import {getUnitById, initUnits} from './units';
import {generateDeck, getCard} from './deck';
import {coin} from '../utils';
import {genereateNewFied, fieldCalc} from './field';

export function initData(state) {
  const UNIT_SRC = require('./units-list.json') || [];
  const GAME_FIELD = genereateNewFied();
  const DECK = List([]);
  const HAND = List([{id:1, unit: null},
    Map({id: 2, unit: null}),
    Map({id: 3, unit: null}),
    Map({id: 4, unit: null}),
    Map({id: 5, unit: null})]);
  const UNITS = initUnits(UNIT_SRC);
  return state.set('initField', GAME_FIELD)
              .set('initHand', HAND)
              .set('initDeck', DECK)
              .set('units', UNITS);
}

export function chekWin () {

};

function dmgOnePlayer (state, roomId, player) {
  const targerPlayer = Number(!player);
  const atak = state.get(roomId).get('players').get(player).get('atak');
  if (atak && atak.count() > 2) {
    var atakOnlyDmg = atak.map(atk => atk.getIn(['unit', 'atk']));
    const dmg = atakOnlyDmg.reduce( function (prev, currentValue) {
      return prev + currentValue;
    });
    return state.setIn([roomId, 'players', targerPlayer, 'hp'],
                       state.getIn([roomId, 'players', targerPlayer, 'hp']) - dmg)
                .setIn([roomId, 'field'], state.get('initField'));
  } else {
    return state;
  }
}

function dmgPlayers (state, roomId) {
  return dmgOnePlayer(dmgOnePlayer(state, roomId, 1), roomId, 0);
}

export function nextTurn(state, roomId) {
  const curPlayer = state.get(roomId).get('curPlayer') || '';
  const p1 = state.get(roomId).get('players').get(0).get('name') || 'P1';
  const p2 = state.get(roomId).get('players').get(1).get('name') || 'P2';

  if ((!curPlayer && coin()) || curPlayer === p2) {
    return getCard(dmgPlayers(fieldCalc(state.setIn([roomId, 'curPlayer'], p1)
                .setIn([roomId, 'players', 0, 'canSetCards'], true)
                .setIn([roomId, 'players', 1, 'canSetCards'], false), roomId), roomId), roomId, 1);
  }
  else  {
    return getCard(dmgPlayers(fieldCalc(state.setIn([roomId, 'curPlayer'], p2)
                .setIn([roomId, 'players', 1, 'canSetCards'], true)
                .setIn([roomId, 'players', 0, 'canSetCards'], false), roomId), roomId), roomId, 0);
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
  const P1 = 0;
  const P2 = 1;
  const p1data = state.get(roomId)
                      .get('players')
                      .get(P1)
                      .merge(Map(generateDeck(state, roomId, P1, 'comander-deck')))
                      .set('hp', 20);
  const p2data = state.get(roomId)
                      .get('players')
                      .get(P2)
                      .merge(Map(generateDeck(state, roomId, P2, 'mage-deck')))
                      .set('hp', 20);

  return state.setIn([roomId, 'field'], state.get('initField'))
              .setIn([roomId, 'ready'], true)
              .setIn([roomId, 'players', 0], p1data)
              .setIn([roomId, 'players', 1], p2data);
}
