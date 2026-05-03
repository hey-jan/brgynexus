import "dotenv/config";
import { sendEmail } from "../src/lib/resend";
import * as React from "react";
// We use a simple string for testing if the component path is tricky in the scratch script
// But since we want to test the full flow, let's try to just send a text email first

async function main() {
  console.log("Sending test email via Resend...");
  
  // Note: If you haven't verified a domain, you can only send to yourself
  // using onboarding@resend.dev
  const result = await sendEmail({
    to: "johnearl.balabat@gmail.com", 
    subject: "BrgyNexus Test Email",
    text: "This is a test email from your BrgyNexus development environment using Resend.",
  });

  if (result.success) {
    console.log("✓ Email sent successfully!", result.data);
  } else {
    console.error("✗ Failed to send email:", result.error);
  }
}

main().catch(console.error);
