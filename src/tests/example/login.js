import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { HttpClient } from '../../utils/api/base.js';

const env = JSON.parse(open('../../../config.json'));

const httpClient = new HttpClient();

const token = __ENV.token ?? env.token;
const tenantId = __ENV.tenantID ?? env.tenantID;
const telefoneCelular = __ENV.telefoneCelular ?? env.telefoneCelular;
const defaultHeaders = {
  'X-Is-Test': true,
  'Content-Type': 'application/json',
  Tenant: tenantId,
};

export const errorRate = new Rate('errors');

export const loginSuccessRate = new Rate('login_success_rate');
export const loginResponseTime = new Trend('login_response_time', true);

export function handleSummary(data) {
  return {
    'report/login-test.html': htmlReport(data),
  };
}

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    // Latência geral
    http_req_duration: ['p(95)<500', 'p(99)<800'],

    // Erros
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],

    // Success Rate por endpoint
    login_success_rate: ['rate>0.99'],

    // Response Time por endpoint
    login_response_time: ['p(95)<400'],
  },
};

export default function () {
  group('Login - login', function () {
    const res = httpClient.usePost({
      nomeRequest: 'login',
      headers: defaultHeaders,
      token,
      body: {
        login: telefoneCelular.toString(),
        type: 0,
      },
    });

    const success = check(
      res,
      {
        'status 200': (r) => r.status === 200,
        'response < 400ms': (r) => r.timings.duration < 400,
      },
      { endpoint: 'login' },
    );

    errorRate.add(!success, { endpoint: 'login' });
    loginSuccessRate.add(res.status === 200, { endpoint: 'login' });
    loginResponseTime.add(res.timings.duration, { endpoint: 'login' });
  });
}
