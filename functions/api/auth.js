// Cloudflare Pages Function for GitHub OAuth token exchange
// This runs at /api/auth

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://triunghi.md',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { code } = await request.json();
    
    if (!code) {
      return new Response(JSON.stringify({ error: 'No authorization code provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Triunghi.md CMS',
      },
      body: JSON.stringify({
        client_id: 'Ov23liSvb4wITabAOGoo',
        client_secret: env.GITHUB_CLIENT_SECRET, // Set in Pages environment variables
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify({ 
        error: tokenData.error_description || tokenData.error 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Verify user has access to the repository
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Triunghi.md CMS',
      },
    });

    if (!userResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch user data' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const userData = await userResponse.json();

    // Check repository access (only allow nalyk or collaborators)
    if (userData.login !== 'nalyk') {
      const repoResponse = await fetch('https://api.github.com/repos/nalyk/ungheni-news/collaborators/' + userData.login, {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Triunghi.md CMS',
        },
      });

      if (!repoResponse.ok) {
        return new Response(JSON.stringify({ 
          error: `Unauthorized: User ${userData.login} does not have write access to repository` 
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Return the token for CMS use
    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope,
      user: {
        login: userData.login,
        name: userData.name,
        email: userData.email,
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://triunghi.md',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}