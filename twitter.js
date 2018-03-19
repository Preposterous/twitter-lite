// @flow

const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const Fetch = require("cross-fetch");
const qs = require("querystring");
const Stream = require("./stream");

const getUrl = subdomain => `https://${subdomain}.twitter.com/1.1`;
const createOauthClient = ({ key, secret }) => {
  const client = OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto
        .createHmac("sha1", key)
        .update(baseString)
        .digest("base64");
    }
  });

  return client;
};

type Defaults = {
  subdomain: "api" | "stream" | "userstream" | "sitestream" | "upload",
  consumer_key: ?string,
  consumer_secret: ?string,
  access_token_key: ?string,
  access_token_secret: ?string,
  bearer_token: ?string
};

const defaults = {
  subdomain: "api",
  consumer_key: null,
  consumer_secret: null,
  access_token_key: null,
  access_token_secret: null,
  bearer_token: null
};

const baseHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

class Twitter {
  constructor(options) {
    const config = Object.assign({}, defaults, options);
    this.authType = config.bearer_token ? "App" : "User";
    this.client = createOauthClient({
      key: config.consumer_key,
      secret: config.consumer_secret
    });

    this.token = {
      key: config.access_token_key,
      secret: config.access_token_secret
    };

    this.url = getUrl(config.subdomain);
    this.config = config;
  }

  async get(resource, options = {}) {
    const { params } = options;
    return this.makeRequest({ method: "GET", resource, params });
  }

  async post(resource, options = {}) {
    const { body, params } = options;
    return this.makeRequest({ method: "POST", resource, body, params });
  }

  getHeaders(requestData) {
    if (this.authType === "User") {
      const headers = this.client.toHeader(
        this.client.authorize(requestData, this.token)
      );
      return headers;
    } else {
      return {
        Authorization: `Bearer ${this.config.bearer_token}`
      };
    }
  }

  async makeRequest({ method, resource, params, body }) {
    const requestData = {
      url: `${this.url}/${resource}.json`,
      method
    };

    const headers = this.getHeaders(requestData);
    requestData.headers = headers;

    if (params) requestData.url += `?${qs.stringify(params)}`;

    const response = await Fetch(requestData.url, requestData);
    const results = await response.json();

    return {
      response,
      results
    };
  }

  stream(resource, { params, body }) {
    if (this.authType !== "User")
      throw Error("Streams require user context authentication");

    const stream = new Stream();

    const requestData = {
      url: `${getUrl("stream")}/${resource}.json`,
      method: "GET"
    };
    if (parameters) requestData.url += "?" + querystring.stringify(parameters);

    const headers = this.client.toHeader(
      this.client.authorize(requestData, this.token)
    );

    const request = Fetch(requestData.url, { headers });

    request
      .then(response => {
        this.stream.destroy = () => response.body.destroy();

        response.status === 200
          ? stream.emit("start", response)
          : stream.emit("error", Error(`Status Code: ${response.status}`));

        response.body
          .on("data", chunk => stream.parse(chunk))
          .on("error", error => stream.emit("error", error))
          .on("end", () => stream.emit("end", response));
      })
      .catch(error => stream.emit("error", error));

    return stream;
  }
}

module.exports = Twitter;
