import Express from 'express';
import Http from 'http';
import Io from 'socket.io';
import Path from 'path';

export function startServer(store) {

  const app = new Express();
  const http = new Http.Server(app);
  const io = new Io(http);

  http.listen(3001, function() {
      console.log('listening on *:3001');
  });
  app.use(Express.static(Path.join(__dirname, 'public')));

  store.subscribe(
    () => io.emit('state', store.getState().toJS())
  );

  io.on('connection', (socket) => {
    socket.emit('state', store.getState().toJS());
    socket.on('action', store.dispatch.bind(store));
  });
}
