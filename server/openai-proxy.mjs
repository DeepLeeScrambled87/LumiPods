import { createServer } from 'node:http';

const port = Number(process.env.PORT || 8787);
const openaiApiKey = process.env.OPENAI_API_KEY || '';
const openaiBaseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com').replace(/\/$/, '');

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(payload));
};

const sendAudio = async (res, upstreamResponse) => {
  const audioBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
  res.writeHead(upstreamResponse.status, {
    'Content-Type': upstreamResponse.headers.get('content-type') || 'audio/mpeg',
    'Content-Length': String(audioBuffer.length),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(audioBuffer);
};

const sendStream = async (res, upstreamResponse) => {
  res.writeHead(upstreamResponse.status, {
    'Content-Type': upstreamResponse.headers.get('content-type') || 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!upstreamResponse.body) {
    res.end();
    return;
  }

  const reader = upstreamResponse.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      if (value) {
        res.write(Buffer.from(value));
      }
    }
  } finally {
    reader.releaseLock();
    res.end();
  }
};

const readRequestBody = async (req) =>
  new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk.toString();
    });

    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });

const isHealthRoute = (pathname) =>
  pathname === '/health' || pathname === '/api/openai/health';

const isChatRoute = (pathname) =>
  pathname === '/v1/chat/completions' || pathname === '/api/openai/v1/chat/completions';

const isSpeechRoute = (pathname) =>
  pathname === '/v1/audio/speech' || pathname === '/api/openai/v1/audio/speech';

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && isHealthRoute(pathname)) {
    sendJson(res, 200, {
      ok: true,
      proxy: 'openai',
      configured: Boolean(openaiApiKey),
      baseUrl: openaiBaseUrl,
    });
    return;
  }

  if (!openaiApiKey) {
    sendJson(res, 500, {
      error: 'OPENAI_API_KEY is not configured on the server proxy.',
    });
    return;
  }

  try {
    if (req.method === 'POST' && isChatRoute(pathname)) {
      const body = await readRequestBody(req);
      const upstream = await fetch(`${openaiBaseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (body.stream) {
        if (!upstream.ok) {
          const errorPayload = await upstream.json().catch(() => ({
            error: upstream.statusText,
          }));
          sendJson(res, upstream.status, errorPayload);
          return;
        }

        await sendStream(res, upstream);
        return;
      }

      const json = await upstream.json();
      sendJson(res, upstream.status, json);
      return;
    }

    if (req.method === 'POST' && isSpeechRoute(pathname)) {
      const body = await readRequestBody(req);
      const upstream = await fetch(`${openaiBaseUrl}/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!upstream.ok) {
        const errorPayload = await upstream.json().catch(() => ({
          error: upstream.statusText,
        }));
        sendJson(res, upstream.status, errorPayload);
        return;
      }

      await sendAudio(res, upstream);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Unexpected proxy error',
    });
  }
});

server.listen(port, () => {
  console.log(`OpenAI proxy listening on http://localhost:${port}`);
});
