# Spotify Authentication

npm package to do the **Authorization Code Flow** with the Spotify API. This package solely focuses on authentication and not on the Spotify Web API. You get an abstraction layer to build and make the authentication requests for you. Besides:
 - 1 single file encapsulating all the logic
 - Small size (±3KB)
 - No third party dependencies (in fact, no need to do `npm install` to run this repo directly!)
 
## Installation
`npm install spotify-authentication`

## Example

You can use this package on your project as:
```javascript
const SpotifyAuthentication = require('spotify-authentication');

const spotifyAuthentication = new SpotifyAuthentication();

spotifyAuthentication.setKeys('client_id', 'client_secret');

// Before this call the host points to `https://accounts.spotify.com`
// You can use this method to point to a proxy such as [spotify-proxy-oauth2](https://github.com/antonio-ramadas/spotify-proxy-oauth2)
spotifyAuthentication.setHost('https://my-alternative-host.com');

// Before this call there is no Redirect URI
spotifyAuthentication.setRedirectUri('https://my-redirect.com');

// Returns a URL object pointing to:
// `https://my-alternative-host.com/authorize?client_id=client_id&response_type=code&redirect_uri=https%3A%2F%2Fmy-redirect.com%2F&state=state&scope=scope&show_dialog=true`
spotifyAuthentication.createAuthorizeURL('scope', 'state', true || 'showDialog');

// Returns a promise which resolves to the response from the Spotify API
spotifyAuthentication.authorizationCodeGrant('code obtained from the Spotify API from the previous interaction')
    .then(console.log, console.error);

// Returns a promise which resolves to the response from the Spotify API
spotifyAuthentication.refreshAccessToken('my-refresh-token')
    .then(console.log, console.error);

// Set the refresh token (it is undefined before this call)
spotifyAuthentication.setRefreshToken('my-refresh-token');

```

## Alternatives

If you are looking for something more feature complete, you are far better of with [Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node). Besides authentication, it also has an API to interact with the Web API.

I primarily developed this repo, because it is [not easy to change the host on the Spotify Web API Node](https://github.com/thelinmichael/spotify-web-api-node/blob/2fcd60c30368255dab658b534b4229909ace5d43/src/authentication-request.js#L5). I want to [point the host to a proxy to hide the credentials](https://github.com/antonio-ramadas/spotify-proxy-oauth2) (i.e., the client secret).
