import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = 'https://vote.kaze-cloud.fr';

let voteResponseTime = new Trend('vote_response_time');

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let res = http.get(`${BASE_URL}`);
  check(res, {
    'Page chargée avec succès': (r) => r.status === 200,
  });

  const choices = ['a', 'b'];
  let voteChoice = choices[Math.floor(Math.random() * choices.length)];

  let payload = JSON.stringify({ vote: voteChoice });
  let params = { headers: { 'Content-Type': 'application/json' } };
  let voteRes = http.post(`${BASE_URL}/`, payload, params);
  voteResponseTime.add(voteRes.timings.duration);

  check(voteRes, {
    'Vote soumis avec succès': (r) => r.status === 200,
  });

  sleep(1);
}
