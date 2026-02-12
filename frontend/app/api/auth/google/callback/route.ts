import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      // User denied access or error occurred
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_code', request.url)
      );
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${request.nextUrl.origin}/api/auth/google/callback`;

    if (!clientId || !clientSecret) {
      console.error('Google OAuth credentials not configured');
      return NextResponse.redirect(
        new URL('/dashboard?error=config_error', request.url)
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(
        new URL('/dashboard?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_access_token', request.url)
      );
    }

    // Fetch user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(
        new URL('/dashboard?error=userinfo_fetch_failed', request.url)
      );
    }

    const userInfo = await userInfoResponse.json();

    // Parse state to get redirect URL
    let redirectPath = '/dashboard';
    try {
      if (state) {
        const stateData = JSON.parse(atob(state));
        if (stateData.redirect) {
          redirectPath = stateData.redirect;
        }
      }
    } catch (e) {
      // Use default redirect
    }

    // Store user info in session storage via a redirect with hash
    // We'll use a client-side page to handle the storage
    const userData = {
      name: userInfo.name || 'Google User',
      email: userInfo.email || '',
      phone: userInfo.phone_number || '+91 9876543210',
      provider: 'google',
      picture: userInfo.picture || '',
    };

    // Encode user data to pass via URL
    const userDataEncoded = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect to a client-side handler page
    return NextResponse.redirect(
      new URL(`${redirectPath}?google_auth_success=true&user=${userDataEncoded}`, request.url)
    );
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=callback_error', request.url)
    );
  }
}

