(() => {

	// Elements
	const connectBtn = document.getElementById('connect-btn');
	const connectPeerIdInput = document.getElementById('input-other-peer-id');
	const setupBtn = document.getElementById('setup-btn');
	const usernameInput = document.getElementById('input-username');
	const buddyNameElem = document.getElementById('buddy-name');
	const chatRoom = document.getElementById('chat-room');
	const messageInput = document.getElementById('input-message');
	const sendMsgBtn = document.getElementById('send-msg-btn');
	const SIDE = { left: 'l', right: 'r' };

	// Update position of the latest message
	const scrollChatRoomToBottom = () => {
		chatRoom.scroll({
			top: chatRoom.scrollHeight - chatRoom.clientHeight + 50,
			behavior: 'smooth'
		});
	}

	// Clear message's input
	const clearInputMessage = () => {
		messageInput.value = '';
		messageInput.focus();
	}

	// Handle sending message
	const handleSendMessage = conn => {
		const message = messageInput.value;
		if (!message) return messageInput.focus();
		createMsgElem(message, SIDE.right);
		conn.send(message);
		clearInputMessage();
		scrollChatRoomToBottom();
	}

	// Create a new message
	const createMsgElem = (msg, side) => {
		const msgElem = document.createElement('div');
		msgElem.classList.add('msg', `${side}-msg`);
		msgElem.innerHTML = msg;
		chatRoom.appendChild(msgElem);
	}

	// Handle incoming data
	let firstMsgSent = false;
	const handleReceiveData = (data) => {
		if (!firstMsgSent) {
			buddyNameElem.innerHTML = data;
			firstMsgSent = true;
			return;
		}
		createMsgElem(data, SIDE.left); // Incomming message is on the left
		scrollChatRoomToBottom();
	}

	// Set up peer
	const setupPeer = (username) => {
		const peer = new Peer({
			host: '/',
			path: '/peerjs/myapp',
			port: 3000
		});
		peer.on('open', id => {
			peer.username = username
			document.getElementById('peer-id').innerHTML = `${peer.username}'s ID: ${id}`;
		});
		peer.on('error', err => console.error(err));
		return peer;
	}

	// Outgoing connection
	const connectToPeer = (peer, peerId) => {
		const conn = peer.connect(peerId);
		conn.on('open', () => {
			conn.send(peer.username);
			conn.on('data', handleReceiveData);

			// Send Message
			sendMsgBtn.onclick = () => {
				handleSendMessage(conn);
			}
		});
	}

	// Incomming connection
	const receiveConnection = (peer) => {
		peer.on('connection', conn => {
			conn.on('open', () => {
				conn.send(peer.username);
				conn.on('data', handleReceiveData);

				// Send Message
				sendMsgBtn.onclick = () => {
					handleSendMessage(conn);
				}
			});
		});
	}

	const app = () => {
		// Setup new Peer
		let peer;
		setupBtn.onclick = () => {
			const username = usernameInput.value;
			if (!username) return usernameInput.focus();
			peer = setupPeer(username);
			// Receive connection
			receiveConnection(peer);
		}

		// Connect to another peer
		connectBtn.onclick = () => {
			const peerId = connectPeerIdInput.value;
			if (!peerId) return connectPeerIdInput.focus();
			connectToPeer(peer, peerId);
		}
	}
	app();
})();