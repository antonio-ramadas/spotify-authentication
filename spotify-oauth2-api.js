const { URL } = require('url');
const https = require('https');

function addIfDefined(url, key, value) {
    if (value) {
        url.searchParams.append(key, value);
    }
}

function getTokenRequest(spotifyObj, customizeURL) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${spotifyObj.host}/api/token`);

        customizeURL(url);

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
            let data = '';

            res.on('data', (chunk) => { data += chunk; });

            res.on('end', () => resolve(JSON.parse(data)));
        });

        request.on('error', reject);

        request.end();
    });
}

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

    setRefreshToken(token) {
        this.refreshToken = token;
    }

    createAuthorizeURL(scope, state, showDialog) {
        const url = new URL(`${this.host}/authorize`);

        // Mandatory parameters
        addIfDefined(url, 'client_id', this.clientId);
        url.searchParams.append('response_type', 'code');
        addIfDefined(url, 'redirect_uri', this.redirectUri);

        // Optional parameters
        addIfDefined(url, 'state', state);
        addIfDefined(url, 'scope', scope);
        // Spotify defaults `show_dialog` to `false`
        addIfDefined(url, 'show_dialog', showDialog);

        return url;
    }

    authorizationCodeGrant(code) {
        return getTokenRequest(this, (url) => {
            // Mandatory parameters
            url.searchParams.append('code', code);
            url.searchParams.append('grant_type', 'authorization_code');
            addIfDefined(url, 'redirect_uri', this.redirectUri);
        });
    }

    refreshAccessToken() {
        return getTokenRequest(this, (url) => {
            // Mandatory parameters
            url.searchParams.append('refresh_token', this.refreshToken);
            url.searchParams.append('grant_type', 'refresh_token');
        });
    }
}

module.exports = SpotifyOAuth2;
