import http from 'k6/http';
const env = JSON.parse(open('../../../config.json'));

const API = __ENV.baseUrlApi ?? env.baseUrlApi;

let APIGet = {
  productGet: API + 'product',
};

let APIPost = {
  productPost: API + 'product',
};

let APIDelete = {
  productDelete: API + 'product',
};

let APIPut = {
  productPut: API + 'product',
};

export class HttpClient {
  useGet(options) {
    let url = options.endpoint ?? '';
    if (options.nomeRequest) {
      url = this.buildUri(APIGet[options.nomeRequest], options.params);
    }

    const params = {
      headers: this.buildHeaders(options.token, options.headers),
    };

    const response = http.get(url, params);

    return response;
  }

  usePost(options) {
    let url = options.endpoint ?? '';
    if (options.nomeRequest) {
      url = this.buildUri(APIPost[options.nomeRequest], options.params);
    }

    const params = {
      headers: this.buildHeaders(options.token, options.headers),
    };

    const body = options.body ? JSON.stringify(options.body) : null;

    const response = http.post(url, body, params);

    return response;
  }

  useDelete(options) {
    let url = options.endpoint ?? '';
    if (options.nomeRequest) {
      url = this.buildUri(APIDelete[options.nomeRequest], options.params);
    }

    const params = {
      headers: this.buildHeaders(options.token, options.headers),
    };

    const body = options.body ? JSON.stringify(options.body) : null;

    const response = http.del(url, body, params);

    return response;
  }

  usePut(options) {
    let url = options.endpoint ?? '';
    if (options.nomeRequest) {
      url = this.buildUri(APIPut[options.nomeRequest], options.params);
    }

    const params = {
      headers: this.buildHeaders(options.token, options.headers),
    };

    const body = options.body ? JSON.stringify(options.body) : null;

    const response = http.put(url, body, params);

    return response;
  }

  buildHeaders(token, extraHeaders) {
    let header = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...extraHeaders,
    };

    if (token) {
      header = { ...header, Authorization: `Bearer ${token}` };
    }

    return header;
  }

  buildUri(url, params) {
    if (!params) return url;

    const query = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return `${url}?${query}`;
  }
}
