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

var io = require( 'socket.io' ).listen( app );

io.sockets.on( 'connection', function( socket ){
	function log() {
		var array = ['*** Server log message: '];
		for( var i = 0; i < arguments.length; i++ ){
			array.push( arguments[i] );
			console.log( arguments[i] );
		}
		socket.emit( 'log', array );
		socket.broadcast.emit( 'log', array );
	}

	log( 'A website connected to the server' );

	socket.on( 'disconnect', function( socket ){
		log( 'A website disconnected from the server' );
	})
})









