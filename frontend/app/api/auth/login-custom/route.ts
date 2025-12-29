import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }


    // Prepare the token request payload
    const tokenRequestPayload = {
      grant_type: 'password',
      username: email,
      password: '***', // Password masked in logs
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: '***', // Secret masked in logs
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
      realm: 'Username-Password-Authentication', // Database connection name (use 'realm' for password grant)
    };

    console.log('Auth0 Domain:', process.env.AUTH0_DOMAIN);
    console.log('Token Request Payload (with masked secrets):', tokenRequestPayload);

    // Authenticate with Auth0 using Resource Owner Password Grant
    const tokenResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email',
          realm: 'Username-Password-Authentication',
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    console.log('Auth0 Response Status:', tokenResponse.status);
    console.log('Auth0 Response Data:', JSON.stringify(tokenData, null, 2));

    // Handle MFA requirement from Auth0 ROPG
    if (!tokenResponse.ok) {
      console.error('Auth0 token error:', tokenData);

      // If MFA is required, surface mfa_token and let client proceed to MFA step
      if (tokenData.error === 'mfa_required' && tokenData.mfa_token) {
        console.log('MFA REQUIRED - Returning mfaToken to frontend');
        return NextResponse.json(
          {
            mfaRequired: true,
            mfaToken: tokenData.mfa_token,
            userEmail: email, // Pass email to frontend for MFA enrollment
            challengeType: 'email',
            message: 'Multi-factor authentication required. A verification code will be emailed.'
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { 
          error: tokenData.error_description || 'Invalid credentials',
          details: tokenData.error || 'authentication_failed',
          auth0Error: tokenData
        },
        { status: 401 }
      );
    }

    console.log('Login successful WITHOUT MFA - tokens received directly');

    // Get user info
    const userInfoResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // Create response with user info and tokens
    const response = NextResponse.json({
      success: true,
      user: userInfo,
      accessToken: tokenData.access_token,
      idToken: tokenData.id_token,
      expiresIn: tokenData.expires_in,
    });

    // Set secure httpOnly cookies for tokens
    response.cookies.set('auth_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
      path: '/',
    });

    if (tokenData.id_token) {
      response.cookies.set('auth_id_token', tokenData.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokenData.expires_in,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
