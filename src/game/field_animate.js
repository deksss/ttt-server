import {Map, List} from 'immutable';
import {shuffleArray} from '../utils';

function genPlayerAtak(state, player)  { 
  const atakFrame = state.getIn([ 'players', player, 'atak']) || false;
  if (atakFrame && atakFrame.count() > 2) { 
    return state.get('field').map(cell => {
                   if (atakFrame.find(cellAtk => 
                         cellAtk.get('index') === cell.get('index'))) {
                     return cell.set('atakPlayer', true); 
                   } else {
                    return cell;
                   }   
        })  
  } else {
    return false;
  }
}

export function genFieldAnimation (state) {
  let animatedField = 
    state.get('ataksAction').map(function (atak) {
      return  state.get('field')
                   .setIn([atak.get('targetIndex'), 'dmgGet'], atak.get('dmg'))
             .setIn([atak.get('atakerIndex'), 'atkDirect'], atak.get('direct') );
  });
  const p1atak = genPlayerAtak(state, 0);
  const p2atak = genPlayerAtak(state, 1);

  if (p1atak) { 
    return state.set('fieldAnimation', 
                 animatedField.push(p1atak));
  } if (p2atak) {
      return state.set('fieldAnimation', 
                       animatedField.push(p2atak));
  } else {
    return state.set('fieldAnimation', 
                     animatedField);  
  }
}