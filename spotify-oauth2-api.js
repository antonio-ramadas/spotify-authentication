const { URL } = require('url');

class SpotifyOAuth2 {
    constructor() {
        this.setHost('https://accounts.spotify.com');
    }

    setHost(host) {
        this.host = host;
    }

    setKeys(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    setRedirectUri(redirectUri) {
        this.redirectUri = redirectUri;
    }

    createAuthorizeURL(scope, state, showDialog) {
        const url = new URL(`${this.host}/authorize`);

        /* eslint-disable func-names */
        // A lambda would be nicer, but it would be lost the proper scope to use `this`
        url.addIfDefined = function (key, value) {
            if (value) {
                this.searchParams.append(key, value);
            }
        };
        /* eslint-enable func-names */

        // Mandatory parameters
        url.addIfDefined('client_id', this.clientId);
        url.searchParams.append('response_type', 'code');
        url.addIfDefined('redirect_uri', this.redirectUri);

        // Optional parameters
        url.addIfDefined('state', state);
        url.addIfDefined('scope', scope);
        // Spotify defaults `show_dialog` to `false`
        url.addIfDefined('show_dialog', showDialog);

        return url;
    }
}

module.exports = SpotifyOAuth2;
