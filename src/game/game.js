import {List, Map} from 'immutable';
import {getUnitById, initUnits} from './units';
import {generateDeck, getCard, getCardForPrevCurPlayer} from './deck';
import {coin} from '../utils';
import {genereateNewFied} from './field';
import {turnCalc} from './turn';
import {botTurn} from './bot'

export function initData(state) {
  const UNIT_SRC = require('./units-list.json') || [];
  const GAME_FIELD = genereateNewFied();
  const DECK = List([]);
  const HAND = List([{id:0, unit: null},
    Map({id: 1, unit: null}),
    Map({id: 2, unit: null}),
    Map({id: 3, unit: null}),
    Map({id: 4, unit: null})]);
  const UNITS = initUnits(UNIT_SRC);
  const DECK_LIST = List(require('./basic-deck-list.json'));
  return state.set('initField', GAME_FIELD)
              .set('initHand', HAND)
              .set('initDeck', DECK)
              .set('units', UNITS)
              .set('rooms', List([]))
              .set('deckList', DECK_LIST);
}

export function chekWin (state) {
  const roomStatePlayers = state.get('players');
  const p1HP = roomStatePlayers.getIn([ 0,  'hp']);
  const p2HP = roomStatePlayers.getIn([ 1,  'hp']);
  if (p1HP < 1 && p2HP > 0) {
    return state.set('winner', 'P2');
  } else if (p2HP < 1 && p1HP > 0) {
    return state.set('winner', 'P1');
  } else if (p1HP < 1 && p2HP < 1) {
    return state.set('winner', 'Draw!');
  } else {
    if (roomStatePlayers.getIn([ 1,  'id']) === 'bot1' &&
        state.get('curPlayer') === 'P2') {     
      return botTurn(state, 1);
    } else {
      return state;    
    }
  }
};

function dmgOnePlayer (state, player) {
  const targerPlayer = Number(!player);
  const atak = state.getIn(['players', player, 'atak']);
  if (atak && atak.count() > 2) {
    var atakOnlyDmg = atak.map(atk => atk.getIn(['unit', 'atk']));
    const dmg = atakOnlyDmg.reduce( function (prev, currentValue) {
      return prev + currentValue;
    });
    return state.setIn(['players', targerPlayer, 'hp'],
                       state.getIn(['players', targerPlayer, 'hp']) - dmg)
                .set('field', state.get('initField'));
  } else {
    return state;
  }
}

function dmgPlayers (roomState) {
  return dmgOnePlayer(dmgOnePlayer(roomState, 1), 0);
}


export function setCurPlayer(roomState) {
  const curPlayer = roomState.get('curPlayer') || false;
  var newCurNumber = 0;
  var oldCurNumber = 1;
  
  if ((curPlayer && curPlayer === roomState.getIn(['players', 0, 'name'])) ||
      (!curPlayer && coin())) {
    newCurNumber = 1;
    oldCurNumber = 0;   
  }

  return roomState.set('curPlayer', 
                       roomState.getIn(['players', newCurNumber, 'name']))
                  .setIn(['players', newCurNumber, 'canSetCards'], true)
                  .setIn(['players', oldCurNumber, 'canSetCards'], false)
                  .set('oldCurPlayer', oldCurNumber); 
}


export function nextTurn (state, roomId) {
  const newState = 
  chekWin(
    getCardForPrevCurPlayer( 
      dmgPlayers(
        turnCalc(
          setCurPlayer(
            state.get(roomId))
          )
        )
      )
    );
  return state.set(roomId, newState);
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
  const p1DeckName = state.getIn([roomId, 'players', P1, 'deckName']) ;
  const p2DeckName = state.getIn([roomId, 'players', P2, 'deckName']) ;

  const p1data = state.get(roomId)
                      .get('players')
                      .get(P1)
                      .merge(Map(generateDeck(state, p1DeckName)))
                      .set('hp', 20);
  const p2data = state.get(roomId)
                      .get('players')
                      .get(P2)
                      .merge(Map(generateDeck(state, p2DeckName)))
                      .set('hp', 20);

  return state.setIn([roomId, 'field'], state.get('initField'))
              .setIn([roomId, 'ready'], true)
              .setIn([roomId, 'players', 0], p1data)
              .setIn([roomId, 'players', 1], p2data);
}
