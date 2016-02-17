import {getUnitById} from './units';
import {shuffleArray} from '../utils';
import {List, Map} from 'immutable';

const MAXCARDINHAND = 5;

export function generateDeck (state, roomId, playerNumber, deckId) {
  const START_CARD_COUNT = 3;
  const deckUnitIds = require('./deck/' + deckId +'.json');
  const deck = shuffleArray(deckUnitIds.map(unitId => getUnitById(state, unitId)));
  const hand = deck.splice(0, START_CARD_COUNT).map( function(unit, index) {
  	return Map({id: index, unit: unit});
  }  );

  return {'deck': List(deck), 'hand': state.get('initHand').merge(List(hand))};
}

export function getCard (state, roomId, playerNumber, count = 1) {
  const deck = state.getIn([roomId, 'players', playerNumber, 'deck']);
  const handCardCount = state.getIn([roomId, 'players', playerNumber, 'hand']).count();

  if (!deck.isEmpty() && handCardCount <= MAXCARDINHAND) {
    const newHand = state.getIn([roomId, 'players', playerNumber, 'hand'])
                         .push(deck.last().set('id', handCardCount+1));
    const newDeck = oldDeck.pop();
    if (count<=1) {
      return state.setIn([roomId, 'players', playerNumber, 'hand'], newHand)
                  .setIn([roomId, 'players', playerNumber, 'deck'], newDeck);
    } else {
      getCard(state.setIn([roomId, 'players', playerNumber, 'hand'], newHand)
                   .setIn([roomId, 'players', playerNumber, 'deck'], newDeck)
                   , roomId, playerNumber, count - 1);
    }

  }	else {
  	return state;
  }
}

function selectValidation(data) {
  if (data.selectedCard) {
    return true;
  } else {
  	return false;
  }
}

export function selectCard(state, roomId, playerNumber, id) {
  console.log('roomId '+ roomId);
  console.log('playerNumber ' + playerNumber);
  console.log('cardId '+ id);
  const data = {};
  data.selectedCard = state.getIn([roomId, 'players', playerNumber, 'hand'])
                           .find(card => card.get('id') === id);
  data.roomId = roomId || false;
  data.playerNumber = playerNumber || false;
  if (selectValidation(data)) {
    return state.setIn([roomId, 'players', playerNumber, 'selectedCard'], data.selectedCard);
  } else {
    return state;
  }
}
