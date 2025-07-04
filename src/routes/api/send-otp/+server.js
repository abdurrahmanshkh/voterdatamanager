import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import { env } from '$env/dynamic/private';

const accountSid = env.accountSid; // Twilio Account SID
const authToken = env.authToken; // Twilio Auth Token
const serviceSid = env.serviceSid; // Twilio Verify Service SID

export async function POST({ request }) {
	const { phoneNumber } = await request.json(); // Extract phone number from request body

	// Verify API URL
	const url = `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`;

	try {
		// Send a POST request to the Twilio Verify API
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				To: phoneNumber, // Phone number to send the OTP to
				Channel: 'sms' // Channel can be 'sms' or 'call'
			})
		});

		// Parse the response
		const data = await response.json();

		if (response.ok) {
			// OTP sent successfully
			return json({ success: true, message: 'OTP sent successfully' });
		} else {
			// Error from Twilio API
			return json({ success: false, message: data.message });
		}
	} catch (error) {
		// Handle any network or request errors
		return json({ success: false, message: error.message });
	}
}
