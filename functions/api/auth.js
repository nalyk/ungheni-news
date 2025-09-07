// Cloudflare Pages Function for GitHub OAuth token exchange
// This runs at /api/auth

// Handle both POST (for token exchange) and GET (for auth redirect)
export async function onRequestGet(context) {
  // If this is just a GET request, redirect to GitHub OAuth
  const { request } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (code) {
    // This is the callback from GitHub, exchange code for token
    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Triunghi.md CMS',
        },
        body: JSON.stringify({
          client_id: 'Ov23liSvb4wITabAOGoo',
          client_secret: context.env.GITHUB_CLIENT_SECRET,
          code: code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      // Return HTML that sends token to parent window via postMessage
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
</head>
<body>
  <p>Authorization successful. This window will close automatically.</p>
  <script>
    console.log('🚀 OAuth: Starting Decap CMS handshake...');
    console.log('🔧 OAuth: window.opener exists:', !!window.opener);
    console.log('🔧 OAuth: Current origin:', window.location.origin);
    
    if (window.opener) {
      // Step 1: Send initial handshake (as seen in working implementations)
      console.log('📤 OAuth: Sending authorizing handshake...');
      window.opener.postMessage("authorizing:github", "https://triunghi.md");
      
      // Step 2: Send the actual success message
      setTimeout(() => {
        const message = 'authorization:github:success:' + JSON.stringify({
          token: '${tokenData.access_token}',
          provider: 'github'
        });
        console.log('📤 OAuth: Sending success message:', message);
        window.opener.postMessage(message, 'https://triunghi.md');
        console.log('✅ OAuth: Success message sent');
        
        // Step 3: Close after short delay
        setTimeout(() => {
          console.log('🔒 OAuth: Closing popup window...');
          window.close();
        }, 500);
      }, 100);
      
    } else {
      console.error('❌ OAuth: No window.opener found!');
      setTimeout(() => window.close(), 2000);
    }
  </script>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });

    } catch (error) {
      const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Error</title>
</head>
<body>
  <p>Authorization failed: ${error.message}</p>
  <script>
    console.log('❌ OAuth: Sending error message to parent window...');
    console.log('🔧 OAuth: Error:', '${error.message}');
    
    if (window.opener) {
      const message = 'authorization:github:error:' + JSON.stringify({
        error: '${error.message}'
      });
      console.log('📤 OAuth: Sending error message:', message);
      window.opener.postMessage(message, 'https://triunghi.md');
      console.log('✅ OAuth: Error message sent');
    } else {
      console.error('❌ OAuth: No window.opener found for error!');
    }
    
    setTimeout(() => {
      console.log('🔒 OAuth: Closing error popup...');
      window.close();
    }, 2000);
  </script>
</body>
</html>`;

      return new Response(errorHtml, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
  
  // Initial auth request - redirect to GitHub
  const clientId = 'Ov23liSvb4wITabAOGoo';
  const redirectUri = encodeURIComponent(`${url.origin}/api/auth`);
  const state = Date.now().toString();
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user:email&state=${state}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': githubAuthUrl
    }
  });
}

// Handle CORS preflight requests (if needed)
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://triunghi.md',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}