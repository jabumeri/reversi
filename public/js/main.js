/* Functions for general use */

// This function returns the value associated with 'whichParam' is on the URL
function getURLParameters( whichParam ){
	var pageURL = window.location.search.substring(1);
	console.log(pageURL);
	var pageURLVariables = pageURL.split('&');
	console.log(pageURLVariables);
	for( var i = 0; i < pageURLVariables.length; i++ ){
		var parameterName = pageURLVariables[i].split( '=' );
		if( parameterName[0] === whichParam ){
			return parameterName[1];
		}
	}
}

var username = getURLParameters( 'username' );
if( typeof username == 'undefined' || !username ){
	username = 'Anonymous_' + Math.random();
}

$( '#messages' ).append( '<h4>' + getURLParameters( 'username' ) + '</h4>' );