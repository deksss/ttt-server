import {getUnitById} from './units';
import {shuffleArray} from '../utils';
import {List} from 'immutable';

export function generateDeck (state, roomId, playerNumber, deckId) {
  const START_CARD_COUNT = 3;
  const deckUnitIds = require('./deck/' + deckId +'.json');
  const deck = shuffleArray(deckUnitIds.map(unitId => getUnitById(state, unitId)));
  const hand = deck.splice(0, START_CARD_COUNT);

  return {'deck': deck, 'hand': hand};
}

export function getCard (state, roomId, playerNumber, count = 1) {
  return true; 
}
