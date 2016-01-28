import Express from 'express';
import Http from 'http';
import Io from 'socket.io';
import Path from 'path';

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function newRoom (roomList) {
  const newId = generateUUID();
  const room = {id: newId, p1: true, p2: ''};
  roomList.push(room);
  return roomList;
}

function joinRoom (roomList, newRoomFn) {
  const last = roomList.length - 1;
  var room = roomList[last];
  if (room && !room.p2) {
    room.p2 = true;
    roomList[last] = room;  
  } else {
    roomList = newRoomFn(roomList)
  }
  return roomList;
}

function lastRoomId (roomList) {
  const last = roomList.length - 1;
  return roomList[last].id;
}

export function startServer(store) {

  const app = new Express();
  const http = new Http.Server(app);
  const io = new Io(http);
  var rooms = [];


  http.listen(3001, function() {
      console.log('listening on *:3001');
  });
  app.use(Express.static(Path.join(__dirname, 'public')));

  store.subscribe(
    () => io.emit('state', store.getState().toJS())
  );

  io.on('connection', (socket) => {
    var idForClient;
    joinRoom(rooms, newRoom);
    idForClient = lastRoomId(rooms);
    socket.join(idForClient);
    socket.emit('state', store.getState().toJS());
    socket.emit('your id', idForClient);
    socket.on('action', store.dispatch.bind(store));
    console.log('player join in ' + idForClient);
  });
}
