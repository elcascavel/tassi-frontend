export async function registerUser(authId: string, name: string) {
    const url = `${process.env.API_URL}/users/create?code=${process.env.FUNCTION_KEY}`;
  
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authId, name }),
    });

    if (res.status === 400) {
        const body = await res.text();
        console.warn('User already exists or validation error:', body);
        return;
      }
  
    if (!res.ok) {
      const raw = await res.text();
      console.error('User registration failed:', raw);
      throw new Error(`Failed to register user: ${res.status}`);
    }
  
    return res.json().catch(() => ({}));
  }
  