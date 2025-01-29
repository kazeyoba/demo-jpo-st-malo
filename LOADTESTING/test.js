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

  let voterId = res.cookies.voter_id ? res.cookies.voter_id[0].value : null;

  if (!voterId) {
    console.error('Aucun voter_id trouvé');
    return;
  }

  const choices = ['a', 'b'];
  let voteChoice = choices[Math.floor(Math.random() * choices.length)];

  let payload = JSON.stringify({ voter_id: voterId, vote: voteChoice });
  let params = { headers: { 'Content-Type': 'application/json' } };
  let voteRes = http.post(`${BASE_URL}/`, payload, params);
  voteResponseTime.add(voteRes.timings.duration);

  sleep(1);
}
