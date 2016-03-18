import {List} from 'immutable';

function chekRow(onlyPlyerCell, cell) {
  return chekNeighbor(onlyPlyerCell, cell, 'x');
}

function chekCol(onlyPlyerCell, cell) {
  return chekNeighbor(onlyPlyerCell, cell, 'y')
}

function chekNeighbor(onlyPlyerCell, cell, cordName) {
  const cord = cell.get(cordName);
  const findNeighbor = onlyPlyerCell.filter(cell => cell.get(cordName) === cord);
	if (findNeighbor.count() > 2) {
		return true;
	}	else {
		return false;
	}
}

function chekDiag (onlyPlyerCell, diag) {
  return onlyPlyerCell.filter(cell => {
	  if (cell.get('index') === diag[0] ||
	  	  cell.get('index') === diag[1] ||
	  	  cell.get('index') === diag[2] ) {
	    return true;
	  } else {
		  return false;
	  }
	});
}

function findCellsAtksPlayer(field, playerNumber) {
	const DIAG1 = [0, 4, 8];
	const DIAG2 = [2, 4, 6];
  const onlyPlyerCell = field.filter(cell => cell.get('owner') === playerNumber);
  const rowResult = field.filter(cell => chekRow(onlyPlyerCell, cell));
  const colResult = field.filter(cell => chekCol(onlyPlyerCell, cell));
  const diag1Result = chekDiag(onlyPlyerCell, DIAG1);
  const diag2Result = chekDiag(onlyPlyerCell, DIAG2);
	if (rowResult.count() > 2) {
	  return rowResult;
	} else if (colResult.count() > 2) {
    return colResult;
	} else if (diag1Result.count() > 2) {
    return diag1Result;
	} else if (diag2Result.count() > 2) {
    return diag2Result;
	} else {
		return List([]);
	}
}

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

export function dmgPlayers (roomState) {
  return dmgOnePlayer(dmgOnePlayer(roomState, 1), 0);
}

export function findPlayersAtkCell (state) {
	const field = state.get('field');
	return state.setIn([ "players", 0, 'atak'], findCellsAtksPlayer(field, 0))
	            .setIn(["players", 1, 'atak'], findCellsAtksPlayer(field, 1));
}