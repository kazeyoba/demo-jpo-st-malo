import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = 'https://vote.kaze-cloud.fr';

let getResponseTime = new Trend('get_response_time');
let postResponseTime = new Trend('post_response_time');

export let options = {
    stages: [
        { duration: '5s', target: 10 },
        { duration: '5s', target: 100 },
        { duration: '5s', target: 200 },
        { duration: '5s', target: 400 },
        { duration: '20s', target: 800 },
        { duration: '20s', target: 900 },
        { duration: '20s', target: 1000 },
        { duration: '5s', target: 10 },
    ],
};

export default function () {
    let res = http.get(BASE_URL);
    check(res, {
        'GET - Statut 200': (r) => r.status === 200,
        'GET - Contient le formulaire': (r) => r.body.includes('<form'),
    });

    getResponseTime.add(res.timings.duration);

    let cookies = res.cookies['voter_id'] ? `voter_id=${res.cookies['voter_id'][0]}` : '';

    let voteOption = Math.random() < 0.5 ? 'a' : 'b';
    let postHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies,
    };
    let postData = `vote=${voteOption}`;

    let postRes = http.post(BASE_URL, postData, { headers: postHeaders });

    check(postRes, {
        'POST - Statut 200': (r) => r.status === 200,
        'POST - Contient le vote': (r) => r.body.includes(voteOption),
    });

    postResponseTime.add(postRes.timings.duration);

    sleep(1);
}
