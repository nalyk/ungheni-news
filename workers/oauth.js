// Cloudflare Worker for GitHub OAuth token exchange
// Deploy this to handle /api/auth endpoint

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://triunghi.md',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method === 'POST' && request.url.includes('/api/auth')) {
      try {
        const { code } = await request.json();
        
        if (!code) {
          return new Response(JSON.stringify({ error: 'No authorization code provided' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://triunghi.md',
            },
          });
        }

        // Exchange code for access token with GitHub
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: 'Ov23liSvb4wITabAOGoo',
            client_secret: env.GITHUB_CLIENT_SECRET, // Set in Cloudflare Worker environment
            code: code,
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          return new Response(JSON.stringify({ error: tokenData.error }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://triunghi.md',
            },
          });
        }

        // Verify user has access to the repository
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        const userData = await userResponse.json();
        
        // Check if user has write access to the repo
        const repoResponse = await fetch('https://api.github.com/repos/nalyk/ungheni-news/collaborators/nalyk', {
          headers: {
            'Authorization': `token ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!repoResponse.ok && userData.login !== 'nalyk') {
          return new Response(JSON.stringify({ error: 'Unauthorized: No write access to repository' }), {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'https://triunghi.md',
            },
          });
        }

        return new Response(JSON.stringify({
          access_token: tokenData.access_token,
          token_type: 'bearer',
          scope: tokenData.scope,
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://triunghi.md',
          },
        });

      } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'https://triunghi.md',
          },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};