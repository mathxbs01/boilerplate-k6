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

export const productSuccessRate = new Rate('product_success_rate');
export const productResponseTime = new Trend('product_response_time', true);

export function handleSummary(data) {
  return {
    'report/product-test.html': htmlReport(data),
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
    product_success_rate: ['rate>0.99'],

    // Response Time por endpoint
    product_response_time: ['p(95)<400'],
  },
};

export default function () {
  group('Product - create', function () {
    const res = httpClient.usePost({
      nomeRequest: 'productPost',
      headers: defaultHeaders,
      token,
      body: {
        title: 'New Product',
        price: 29.99,
        description: 'Example product created by k6',
        category: 'electronics',
        image: 'https://example.com/product-image.jpg',
      },
    });

    const success = check(
      res,
      {
        'status 200': (r) => r.status === 200,
        'response < 400ms': (r) => r.timings.duration < 400,
      },
      { endpoint: 'product' },
    );

    errorRate.add(!success, { endpoint: 'product' });
    productSuccessRate.add(res.status === 200, { endpoint: 'product' });
    productResponseTime.add(res.timings.duration, { endpoint: 'product' });
  });
}
