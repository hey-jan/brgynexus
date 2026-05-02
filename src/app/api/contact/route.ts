import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Mock SendGrid behavior: just log the request
    console.log("Mock SendGrid Submission Received:");
    console.log(body);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json(
      { message: "Message received successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process message." },
      { status: 500 }
    );
  }
}
