const endpoints = [
  'http://localhost:8787/health',
  'http://localhost:3002/api/openai/health',
];

const checkEndpoint = async (url) => {
  try {
    const response = await fetch(url);
    const text = await response.text();
    let body;

    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }

    return {
      url,
      ok: response.ok,
      status: response.status,
      body,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: 0,
      body: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

const results = await Promise.all(endpoints.map(checkEndpoint));
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);

const hasFailure = results.some((result) => !result.ok);
process.exit(hasFailure ? 1 : 0);
