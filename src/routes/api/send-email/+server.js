import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';

// Create a mail transporter using nodemailer for Outlook
const transporter = nodemailer.createTransport({
	host: 'smtp.office365.com',
	port: 587,
	secure: false, // Use TLS
	auth: {
		user: 'csmvschatbot@outlook.com',
		pass: env.EMAIL_PASS
	},
	tls: {
		ciphers: 'SSLv3' // Add this to avoid some TLS-related errors
	}
});

export async function POST({ request }) {
	const { verificationCode } = await request.json();

	try {
		// Define email options
		const mailOptions = {
			from: 'csmvschatbot@outlook.com',
			to: 'sajidpatel810@gmail.com',
			subject: "Your OTP to acess Voter's Data",
			text: `Enter the following verification code to access our portal:\n\n${verificationCode}`
		};

		await transporter.sendMail(mailOptions);

		return new Response(JSON.stringify({ success: true }), { status: 200 });
	} catch (error) {
		console.error('Error sending email:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
	}
}
