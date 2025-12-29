import { NextRequest, NextResponse } from 'next/server';

// Initiates an MFA challenge via email for a given mfa_token
export async function POST(request: NextRequest) {
  try {
    const { mfaToken, userEmail } = await request.json();

    if (!mfaToken) {
      return NextResponse.json(
        { error: 'mfaToken is required' },
        { status: 400 }
      );
    }

    const domain = process.env.AUTH0_DOMAIN;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!domain) {
      return NextResponse.json({ error: 'AUTH0_DOMAIN not configured' }, { status: 500 });
    }

    console.log('MFA Challenge Request:', {
      domain,
      mfaToken: mfaToken.substring(0, 20) + '...',
    });

    // First, get available authenticators for this user's MFA token
    const authenticatorsResp = await fetch(`https://${domain}/mfa/authenticators`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${mfaToken}`,
      },
    });

    const authenticatorsData = await authenticatorsResp.json();
    console.log('MFA Authenticators Response Status:', authenticatorsResp.status);
    console.log('MFA Authenticators Response Data:', JSON.stringify(authenticatorsData, null, 2));

    if (!authenticatorsResp.ok) {
      console.error('Failed to get authenticators:', authenticatorsData);
      return NextResponse.json(
        {
          error: authenticatorsData.error || 'authenticator_lookup_failed',
          details: authenticatorsData.error_description || 'Failed to retrieve available authenticators',
          auth0Error: authenticatorsData,
        },
        { status: 400 }
      );
    }

    // Find an active email authenticator (prefer active ones)
    let emailAuthenticator = authenticatorsData.find(
      (auth: any) => auth.authenticator_type === 'oob' && auth.oob_channel === 'email' && auth.active === true
    );

    // If no active email authenticator exists, try to find any email authenticator
    if (!emailAuthenticator) {
      emailAuthenticator = authenticatorsData.find(
        (auth: any) => auth.authenticator_type === 'oob' && auth.oob_channel === 'email'
      );
    }

    // If no email authenticator exists at all, enroll
    if (!emailAuthenticator) {
      console.log('No email authenticator - enrolling');
      
      if (!userEmail) {
        return NextResponse.json(
          { error: 'userEmail is required for enrollment' },
          { status: 400 }
        );
      }

      const associateResp = await fetch(`https://${domain}/mfa/associate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mfaToken}`,
        },
        body: JSON.stringify({
          authenticator_types: ['oob'],
          oob_channels: ['email'],
          email: userEmail,
        }),
      });

      const associateData = await associateResp.json();
      console.log('MFA Associate Response Status:', associateResp.status);
      console.log('MFA Associate Response Data:', JSON.stringify(associateData, null, 2));

      if (!associateResp.ok) {
        console.error('MFA Associate Failed:', associateData);
        return NextResponse.json(
          {
            error: associateData.error || 'associate_failed',
            details: associateData.error_description || 'Failed to enroll email MFA',
            auth0Error: associateData,
          },
          { status: 400 }
        );
      }

      // Associate already sends the email and returns oob_code
      return NextResponse.json({
        success: true,
        oobCode: associateData.oob_code,
        authenticatorId: associateData.authenticator_id,
        bindingMethod: associateData.binding_method,
        message: 'Email MFA enrolled. Verification code has been emailed.'
      });
    }

    console.log('Found active email authenticator:', emailAuthenticator);

    // Now request the challenge using the authenticator ID
    const challengeResp = await fetch(`https://${domain}/mfa/challenge`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        mfa_token: mfaToken,
        challenge_type: 'oob',
        authenticator_id: emailAuthenticator.id,
      }),
    });

    const challengeData = await challengeResp.json();

    console.log('MFA Challenge Response Status:', challengeResp.status);
    console.log('MFA Challenge Response Data:', JSON.stringify(challengeData, null, 2));

    if (!challengeResp.ok) {
      console.error('MFA Challenge Failed:', challengeData);
      return NextResponse.json(
        {
          error: challengeData.error || 'challenge_failed',
          details: challengeData.error_description || 'Failed to start MFA challenge',
          auth0Error: challengeData,
        },
        { status: 400 }
      );
    }

    // Auth0 returns an oob_code to be used in the verification grant
    return NextResponse.json({
      success: true,
      oobCode: challengeData.oob_code,
      bindingMethod: challengeData.binding_method,
      challengeType: challengeData.challenge_type,
      message: 'Verification code has been emailed.'
    });
  } catch (error) {
    console.error('MFA challenge error:', error);
    return NextResponse.json({ error: 'Internal error', details: String(error) }, { status: 500 });
  }
}
