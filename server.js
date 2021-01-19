const path = require('path');
const express = require('express');
const { ExpressPeerServer } = require('peer');

const app = express();
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const server = app.listen(3000, () => console.log("Server started: Listening at port 3000"));
// PeerServer
const peerServer = ExpressPeerServer(server, {
	path: '/myapp'
});
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
	res.render('index.ejs', { msg: "Chat Application" });
});
