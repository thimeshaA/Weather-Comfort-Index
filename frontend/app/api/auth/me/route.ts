import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('auth_id_token')?.value;
    
    if (!idToken) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Decode ID token to get user info
    // ID tokens are JWT tokens with user info in the payload
    const payload = idToken.split('.')[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString();
    const user = JSON.parse(decodedPayload);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
