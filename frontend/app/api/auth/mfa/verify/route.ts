import { NextRequest, NextResponse } from 'next/server';

// Verifies the MFA email code and returns tokens
export async function POST(request: NextRequest) {
  try {
    const { mfaToken, oobCode, otp } = await request.json();

    if (!mfaToken) {
      return NextResponse.json({ error: 'mfaToken is required' }, { status: 400 });
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;
    const audience = process.env.AUTH0_AUDIENCE;

    if (!domain || !clientId || !clientSecret) {
      return NextResponse.json({ error: 'Auth0 env not configured' }, { status: 500 });
    }

    // For email MFA (OOB), Auth0 expects the mfa-oob grant with oob_code (from challenge) and binding_code from email
    const tokenResp = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'http://auth0.com/oauth/grant-type/mfa-oob',
        client_id: clientId,
        client_secret: clientSecret,
        mfa_token: mfaToken,
        oob_code: oobCode,
        binding_code: otp, // The code from email is called "binding_code" in Auth0's MFA OOB flow
        audience,
        scope: 'openid profile email',
      }),
    });

    const tokenData = await tokenResp.json();

    console.log('MFA Verify Response Status:', tokenResp.status);
    console.log('MFA Verify Response:', JSON.stringify(tokenData, null, 2));

    if (!tokenResp.ok) {
      console.error('MFA Verify Failed:', tokenData);
      return NextResponse.json(
        { error: tokenData.error_description || 'Failed to verify MFA', details: tokenData.error || 'mfa_verify_failed', auth0Error: tokenData },
        { status: 400 }
      );
    }

    // Get user info
    const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoResponse.json();

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
    console.error('MFA verify error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
