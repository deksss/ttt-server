import {Map, List} from 'immutable';
import {shuffleArray} from '../utils';
import {setAtk, calcHp, onTurn} from './cells_battle';
import {findPlayersAtkCell} from './players_atak';
import {genFieldAnimation} from './field_animate';

function clearDeath (cell) {
 if (cell.get('died')) {
  return cell.set('died', false)
			 .set('free', true)
			 .set('owner', '')
		     .set('unit', false);
  } else {
    return cell;
  }	
}

function nextPrepeare (state) {
	return state.set('field', state.get('field').map(clearDeath))
	            .set('ataksAction', List([]))
				      .set('fieldAnimation', List([]));
}

function updateCellReady (cell) {
  if (cell.get('unit')) {
    return cell.setIn(['unit','ready'], true);
  } else {
    return cell;
  }
}


function setCardsReady(state) {
  return state.set('field', state.get( 'field')
  	                             .map(cell => updateCellReady(cell)));
}

export function turnCalc (state) {
  if (state.get('field')) {
	  return  genFieldAnimation(
		        findPlayersAtkCell(
			      setCardsReady(
			      calcHp(
			      setAtk(
			      onTurn(
			      nextPrepeare(state)))))));

  } else {
    return state;
  }
}