import { INITIAL_STATE, createRoom, joinRoom} from './core';
import {playerStart, starGame, nextTurn, restart, initData} from  './game/game';
import {getCard, selectCard} from  './game/deck';
import {calcDmg, setCard} from  './game/field';

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
  case 'SELECT_CARD':
    return selectCard(state, action.roomId, action.playerNumber, action.cardId);
  case 'SET_CARD':
    return setCard(state, action.roomId, action.playerNumber, action.cellId);
  case 'GENERATE_DECK':
    return generaneDeck(state, action.roomId, action.playerNumber, action.deckId);
  case 'GET_CARD':
    return getCard(state, action.roomId, action.deckId, action.playerId);
  case 'CAST_SPELL':
    return castSpell(state, action.roomId, action.cardId, action.playerId);
  case 'CALC_DMG':
    return calcDmg(state, action.roomId);
  case 'GENERATE_FIELD_ANIMATION':
    return generateFieldAnimation(state, action.roomId);
  case 'INIT_DATA':
    return initData(state);
  }
  return state;
}
