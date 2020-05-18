/************************************************/
/*         Set up the static file server        */
/*  Include the static file webserver library   */

/* Include the static file webserver library */
var static = require( 'node-static' );

/* Include the http server library */
var http = require( 'http' );

/* Assume that we are running on Heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

if( typeof port == 'undefined' || !port ){
	directory = './public';
	port = 8080;
}

var file = new static.Server( directory );

var app = http.createServer(
	function( request, response){
		request.addListener( 'end',
			function(){
				file.serve( request, response );
			}
		).resume();
	}
).listen( port );
 
console.log( 'Server is running' );

/************************************************/
/*          Set up the web socket server        */

var players = [];

var io = require( 'socket.io' ).listen( app );

io.sockets.on( 'connection', function( socket ){
	log( 'Client connect by ' + socket.id );

	function log() {
		var array = ['*** Server log message: '];
		for( var i = 0; i < arguments.length; i++ ){
			array.push( arguments[i] );
			console.log( arguments[i] );
		}
		socket.emit( 'log', array );
		socket.broadcast.emit( 'log', array );
	}	

	socket.on( 'disconnect', function( socket ){
		log( 'Client disconnected ' + JSON.stringify( players[ socket.id ] ) );

		if( typeof players[ socket.id ] !== 'underfined' && players[ socket.id ] ){
			var username = players[ socket.id ].username;
			var room = players[ socket.id ].room;
			var payload = {
				username: username, 
				socket_id: socket.id
			};

			delete players[ socket.id ];

			io.in( room ).emit( 'player_disconnected', payload );
		}
	});

	
	/* join_room command */
	/* payload: 
	{
		'room': to join,
		'username': username of person joining
	}
	join_room_response:
	{
		'result': 'success',
		'room': room joined,
		'username': username that has joined,
		'socket_id': the socket id of the person that joined,
		'membership': number of people in the room including the new one
	}
	or 
	{
		'result': 'fail',
		'message': failure message
	}
	*/
	socket.on( 'join_room', function( payload ){
		log( '\'join_room\' command' + JSON.stringify( payload ));
		
		// payload is undefined 
		if( typeof payload === 'undefined' || !payload ){
			var error_message = 'join_room had no payload, command aborted';
			log( error_message );
			socket.emit( 'join_room_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}

		// room is undefined 
		var room = payload.room;
		if( typeof room === 'undefined' || !room ){
			var error_message = 'join_room didn\'t specify a room, command aborted';
			log( error_message );
			socket.emit( 'join_room_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}		

		// username is undefined 
		var username = payload.username;
		if( typeof username === 'undefined' || !username ){
			var error_message = 'join_room didn\'t specify a username, command aborted';
			log( error_message );
			socket.emit( 'join_room_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}	

		players[ socket.id ] = {};
		players[ socket.id ].username = username;
		players[ socket.id ].room = room;

		socket.join( room );	

		var roomObject = io.sockets.adapter.rooms[room];
			
		var numClients = roomObject.length;
		var successData = {
			result: 'success',
			room: room,
			username: username,
			socket_id: socket.id,
			membership: numClients
		}


		io.sockets.in( room ).emit( 'join_room_response', successData );

		for( var socket_in_room in roomObject.sockets ){
			var successData = {
				result: 'success',
				room: room,
				username: players[ socket_in_room ].username,
				socket_id: socket_in_room,
				membership: numClients
			};
			socket.emit( 'join_room_response', successData );
		}
		log( 'join_room success' );

	});

	/* send_message command */
	/* payload: 
	{
		'room': room to join,
		'username': username of person sending the message,
		'message': the message to send
	}
	send_message_response:
	{
		'result': 'success',		
		'username': username of the person that spoke
		'message': the message spoken
	}
	or 
	{
		'result': 'fail',
		'message': failure message
	}
	*/
	socket.on( 'send_message', function( payload ){
		log( 'server received a command', 'send_message', payload );
		
		// payload is undefined 
		if( typeof payload === 'undefined' || !payload ){
			var error_message = 'send_message had no payload, command aborted';
			log( error_message );
			socket.emit( 'send_message_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}

		// room is undefined 
		var room = payload.room;
		if( typeof room === 'undefined' || !room ){
			var error_message = 'send_message didn\'t specify a room, command aborted';
			log( error_message );
			socket.emit( 'send_message_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}		

		// username is undefined 
		var username = payload.username;
		if( typeof username === 'undefined' || !username ){
			var error_message = 'send_message didn\'t specify a username, command aborted';
			log( error_message );
			socket.emit( 'send_message_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}	

		var message = payload.message;
		if( typeof message === 'undefined' || !message ){
			var error_message = 'send_message didn\'t specify a message, command aborted';
			log( error_message );
			socket.emit( 'send_message_response' , {
				result: 'fail',
				message: error_message
			});
			return;
		}	

		var successData = {
			result: 'success',
			room: room,
			username: username,
			message: message
		}


		io.sockets.in( room ).emit( 'send_message_response', successData );
		log( 'Message sent to room ' + room + ' by ' + username );
	});
})









