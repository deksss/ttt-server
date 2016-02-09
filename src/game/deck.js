import {getUnitById} from './units';
import {shuffleArray} from '../utils';
import {List} from 'immutable';

const MAXCARDINHAND = 5;

export function generateDeck (state, roomId, playerNumber, deckId) {
  const START_CARD_COUNT = 3;
  const deckUnitIds = require('./deck/' + deckId +'.json');
  const deck = shuffleArray(deckUnitIds.map(unitId => getUnitById(state, unitId)));
  const hand = deck.splice(0, START_CARD_COUNT);

  return {'deck': deck, 'hand': hand};
}

export function getCard (state, roomId, playerNumber, count = 1) {
  const deck = state.getIn([roomId, 'players', playerNumber, 'deck']);
  const handCardCount = state.getIn([roomId, 'players', playerNumber, 'hand']).count();

  if (!deck.isEmpty() && handCardCount <= MAXCARDINHAND) {
    const newHand = state.getIn([roomId, 'players', playerNumber, 'hand']).push(deck.last());	
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
  if (data.roomId && data.selectedCard && data.playerNumber) {
    return true;   
  } else {
  	return false; 
  }
}

export function selectCard(state, roomId, playerNumber, cardId) {
  const data = {};  	
  data.selectedCard = state.get(roomId)
                            .get('players')
                            .get(playerNumber)
                            .get('hand')
                            .get(cardId) || false;
  data.roomId = roomId || false;
  data.playerNumber = playerNumber || false;  

  if (selectCard && selectValidation(data)) {
    return state.setIn([roomId, 'players', playerNumber, 'selectedCard'], data.selectedCard)
                .setIn([roomId, 'players', playerNumber, 'canSetCards'], 0);
  } else {
    return state;
  }
}
