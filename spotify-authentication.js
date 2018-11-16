const { URL } = require('url');
const https = require('https');
const qs = require('querystring');

function getTokenRequest(spotifyObj, body) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${spotifyObj.host}/api/token`);

        const options = {
            host: url.host,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        if (spotifyObj.clientId && spotifyObj.clientSecret) {
            options.auth = `${spotifyObj.clientId}:${spotifyObj.clientSecret}`;
        }

        const request = https.request(options, (res) => {
            const chunks = [];

            res.on('data', chunk => chunks.push(chunk));

            res.on('end', () => {
                const response = JSON.parse(Buffer.concat(chunks).toString());

                let f = resolve;

                if (response.error) {
                    f = reject;
                }

                f(response);
            });
        });

        request.on('error', reject);

        request.write(qs.stringify(body));
        request.end();
    });
}

class SpotifyOAuth2 {
    constructor() {
        this.setHost('https://accounts.spotify.com');
    }

    setHost(host) {
        this.host = new URL(host).origin;
    }

    setKeys(clientId, clientSecret) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    setRedirectUri(redirectUri) {
        this.redirectUri = new URL(redirectUri).href;
    }

    setRefreshToken(token) {
        this.refreshToken = token;
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

    authorizationCodeGrant(code) {
        const body = {};

        // Mandatory parameters
        body.code = code;
        body.grant_type = 'authorization_code';

        if (this.redirectUri) {
            body.redirect_uri = this.redirectUri;
        }

        return getTokenRequest(this, body);
    }

    refreshAccessToken(refreshToken) {
        const body = {};

        // Mandatory parameters
        body.refresh_token = refreshToken || this.refreshToken;
        body.grant_type = 'refresh_token';

        return getTokenRequest(this, body);
    }
}

module.exports = SpotifyOAuth2;
