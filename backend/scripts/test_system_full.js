const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(body);
        } catch (e) {
          json = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function getArray(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.articles)) return body.articles;
  if (body && Array.isArray(body.reviews)) return body.reviews;
  return [];
}

async function runAllTests() {
  console.log('====================================================');
  console.log('   FULL SYSTEM E2E VERIFICATION FOR RENDER DEPLOY');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${extra}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} ${extra}`);
      failed++;
    }
  }

  try {
    // 1. Health check & Keep-alive
    const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    assert('Health Check status 200', health.status === 200);
    assert('Health Check db_mode active', health.body.db_mode === 'PostgreSQL' || health.body.db_mode === 'In-Memory Engine', `(Mode: ${health.body.db_mode})`);

    // 2. Static Serving & SPA fallback
    const rootHtml = await request({ hostname: 'localhost', port: 5000, path: '/', method: 'GET' });
    assert('Root HTML static serve status 200', rootHtml.status === 200);
    assert('Root HTML contains React/Vite mount', typeof rootHtml.body === 'string' && rootHtml.body.includes('id="root"'));

    const spaRoute = await request({ hostname: 'localhost', port: 5000, path: '/lessons', method: 'GET' });
    assert('SPA Catch-All route status 200', spaRoute.status === 200);
    assert('SPA Catch-All returns index.html', typeof spaRoute.body === 'string' && spaRoute.body.includes('id="root"'));

    // 3. SEO Compliance
    const robots = await request({ hostname: 'localhost', port: 5000, path: '/robots.txt', method: 'GET' });
    assert('robots.txt status 200', robots.status === 200);

    const sitemap = await request({ hostname: 'localhost', port: 5000, path: '/sitemap.xml', method: 'GET' });
    assert('sitemap.xml status 200', sitemap.status === 200);

    // 4. Lessons API across N5 - N1
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    for (const lvl of levels) {
      const lessonsRes = await request({ hostname: 'localhost', port: 5000, path: `/api/lessons?level=${lvl}`, method: 'GET' });
      const list = getArray(lessonsRes.body);
      assert(`Lessons API (${lvl}) status 200`, lessonsRes.status === 200);
      assert(`Lessons API (${lvl}) returns data`, list.length > 0, `(${list.length} lessons)`);
    }

    // 5. Vocabularies API across N5 - N1
    for (const lvl of levels) {
      const vocabRes = await request({ hostname: 'localhost', port: 5000, path: `/api/vocabularies?level=${lvl}`, method: 'GET' });
      const list = getArray(vocabRes.body);
      assert(`Vocabularies API (${lvl}) status 200`, vocabRes.status === 200);
      assert(`Vocabularies API (${lvl}) count > 500`, list.length >= 500, `(${list.length} words)`);
    }

    // 6. Kanji API across N5 - N1
    for (const lvl of levels) {
      const kanjiRes = await request({ hostname: 'localhost', port: 5000, path: `/api/kanji?level=${lvl}`, method: 'GET' });
      const list = getArray(kanjiRes.body);
      assert(`Kanji API (${lvl}) status 200`, kanjiRes.status === 200);
      assert(`Kanji API (${lvl}) returns items`, list.length > 0, `(${list.length} kanji)`);
    }

    // 7. Grammar API across N5 - N1
    for (const lvl of levels) {
      const grammarRes = await request({ hostname: 'localhost', port: 5000, path: `/api/grammar?level=${lvl}`, method: 'GET' });
      const list = getArray(grammarRes.body);
      assert(`Grammar API (${lvl}) status 200`, grammarRes.status === 200);
      assert(`Grammar API (${lvl}) returns points`, list.length > 0, `(${list.length} points)`);
    }

    // 8. Particles API & Exercises
    const particlesRes = await request({ hostname: 'localhost', port: 5000, path: '/api/particles?level=N5', method: 'GET' });
    const partList = getArray(particlesRes.body);
    assert('Particles API (N5) status 200', particlesRes.status === 200);
    assert('Particles API returns list', partList.length > 0, `(${partList.length} particles)`);

    const exercisesRes = await request({ hostname: 'localhost', port: 5000, path: '/api/particles/exercises?level=N5', method: 'GET' });
    const exList = getArray(exercisesRes.body);
    assert('Particle Exercises API status 200', exercisesRes.status === 200);
    assert('Particle Exercises returns items', exList.length > 0, `(${exList.length} exercises)`);

    // 9. Forum Articles & Status
    const articlesRes = await request({ hostname: 'localhost', port: 5000, path: '/api/forum/articles', method: 'GET' });
    const artList = getArray(articlesRes.body);
    assert('Forum Articles API status 200', articlesRes.status === 200);
    assert('Forum Articles returns news', artList.length >= 10, `(${artList.length} articles)`);

    const forumStatus = await request({ hostname: 'localhost', port: 5000, path: '/api/forum/status', method: 'GET' });
    assert('Forum Crawler Status 200', forumStatus.status === 200);
    assert('Forum status reports articles and sources', forumStatus.body.success === true && forumStatus.body.totalArticles > 0, `(${forumStatus.body.totalArticles} articles from ${forumStatus.body.activeSources} sources)`);

    // 10. Reviews & Comments
    const reviewsRes = await request({ hostname: 'localhost', port: 5000, path: '/api/forum/reviews', method: 'GET' });
    const revList = getArray(reviewsRes.body);
    assert('Forum Reviews API status 200', reviewsRes.status === 200);
    assert('Forum Reviews returns reviews list', revList.length > 0, `(${revList.length} verified reviews)`);

    // 11. Quiz Generator
    const quizRes = await request({ hostname: 'localhost', port: 5000, path: '/api/quiz/generate?level=N5&lesson=1', method: 'GET' });
    assert('Quiz Generator status 200', quizRes.status === 200);
    assert('Quiz Generator returns questions', Array.isArray(quizRes.body.questions) && quizRes.body.questions.length > 0);

    // 12. Support Feedback Submission
    const feedbackRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/support/feedback',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Render Readiness Tester',
        email: 'tester@nihongohub.com',
        category: 'deployment_test',
        message: 'System pre-flight check for Render cloud deployment.'
      }
    );
    assert('Support Feedback API status 200', feedbackRes.status === 200);
    assert('Support Feedback returns success', feedbackRes.body.success === true);

    // 13. Auth Check with Test User
    const testEmail = `render_test_${Date.now()}@test.com`;
    const regRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        username: 'Render Tester',
        email: testEmail,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    );
    assert('Auth Register API status 200', regRes.status === 200);
    assert('Auth Register returns JWT token', typeof regRes.body.token === 'string');

    // Login with registered user
    const loginRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: testEmail,
        password: 'Password123!'
      }
    );
    assert('Auth Login API status 200', loginRes.status === 200);
    assert('Auth Login returns user data', loginRes.body.user && loginRes.body.user.email === testEmail);

  } catch (err) {
    console.error('Fatal testing error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('ALL TESTS PASSED: 100% HEALTHY AND READY FOR RENDER!');
  } else {
    process.exit(1);
  }
}

runAllTests();
