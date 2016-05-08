/**
 * Title: Spotify palates backend
 * Description: The server side portion of spotify palates
 */

// Get process enviornment for Heroku
process.env.PWD = process.cwd();

// #region MODULES
var express = require("express"),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	bodyParser = require('body-parser'),
	SpotifyWebApi = require('spotify-web-api-node'),
  app = express(),
  port = process.env.PORT || 3000,
  env = process.env.NODE_ENV || 'development'; // process.env.NODE_ENV determines whether this is the heroku app
// #endregion

// #region SPOTIFY_WEB_API_SETUP
 
// credentials are optional 
var spotifyApi = new SpotifyWebApi({
  clientId : process.env.SPOTIFY_PALATES_CLIENT_ID,
  clientSecret : process.env.SPOTIFY_PALATES_CLIENT_SECRET,
  redirectUri : process.env.SPOTIFY_PALATES_REDIRECT_URI
});
// #endregion

// #region SERVER_CONFIG
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session(
	{ 
		resave: false,
		saveUninitialized: true,
		secret: process.env.SPOTIFY_PALATES_SESSION_SECRET, 
		cookie: { maxAge: 60000 }
	})
);
var server = app.listen(port, function () {
    console.log('Listening on port %d', server.address().port);
});
// #endregion

// #region REQUESTS

// #region GET

app.get("/authorize-url", function (req, res) {
	var scopes = ["playlist-read-private","playlist-modify-private","playlist-modify-public", "user-library-read"];
	var state = "authorize";
	var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
	res.status(200).send(authorizeURL);
});

app.get("/callback", function(req, res) {
	if (req.query.state=="authorize") {
		req.session.code = req.query.code;
		spotifyApi.authorizationCodeGrant(req.session.code)
		.then(function(data) {
			req.session.expires =  data.body['expires_in'];
			req.session.accessToken = data.body['access_token'];
			req.session.refreshToken = data.body['refresh_token'];
			spotifyApi.setAccessToken(req.session.accessToken);
			spotifyApi.setRefreshToken(req.session.refreshToken);
			spotifyApi.getMe(function(err,data) {
				if (err) {
					console.log(err);
					res.status(500).send(err);
					return;
				}
				req.session.me = data.body;
				res.status(200).send("Successfully stored credentials");
			});
		}, function(err) {
			console.log('Something went wrong!', err);
			res.status(500).send(err);
		});
	}
	else {
		res.status(400).send("Unrecognized state");
	}
});

app.get("/playlists", function(req, res) {
	spotifyApi.setAccessToken(req.session.accessToken);
	spotifyApi.setRefreshToken(req.session.refreshToken);
	spotifyApi.getUserPlaylists(
		req.session.me.id,
		null,
		function(err,data) {
			if(err) {
				console.log("Could not get user playlists",err);
				res.status(500).send(err);
			}
			else {
				res.status(200).send(data);
			}
		}
	);
});
// #endregion

// #region POST
// #endregion
// #endregio
