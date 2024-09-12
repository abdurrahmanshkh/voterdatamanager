import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import { env } from '$env/dynamic/private';

const accountSid = env.accountSid; // Twilio Account SID
const authToken = env.authToken; // Twilio Auth Token
const serviceSid = env.serviceSid; // Twilio Verify Service SID

export async function POST({ request }) {
	const { phoneNumber, code } = await request.json(); // Extract phone number and OTP code from request body

	// VerificationCheck API URL
	const url = `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`;

	try {
		// Send a POST request to the Twilio Verify API to verify the OTP
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				To: phoneNumber, // Phone number to verify
				Code: code // OTP code entered by the user
			})
		});

		// Parse the response
		const data = await response.json();

		if (response.ok && data.status === 'approved') {
			// OTP verified successfully
			return json({ success: true, message: 'OTP verified successfully' });
		} else {
			// Error during OTP verification
			return json({ success: false, message: 'OTP verification failed', details: data });
		}
	} catch (error) {
		// Handle any network or request errors
		return json({ success: false, message: error.message });
	}
}
