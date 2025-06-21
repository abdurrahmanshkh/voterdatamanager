# Voter Data Management Dashboard

A secure and efficient web application for managing voter data with CSV upload/download, OTP-based authentication, surveyor link generation, and automated voter slip creation.

---

## 📋 Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Tech Stack](#tech-stack)
* [Setup & Installation](#setup--installation)
* [Usage](#usage)
* [Folder Structure](#folder-structure)
* [Deployment](#deployment)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

This project provides an admin-facing dashboard to securely manage voter data with full CRUD capabilities. Built for election teams and survey administrators, it offers tools for bulk import/export via CSV, secure login using OTP, and automatic voter slip generation for fieldwork. Each surveyor gets a unique link for streamlined data handling.

---

## Features

* 🔐 **OTP-Based Login** for secure admin access
* 📥 **CSV Upload/Download** to manage large-scale voter data
* 📝 **CRUD Operations** for individual or batch records
* 🔗 **Unique Surveyor Links** for decentralized access
* 🧾 **Voter Slip Generation** automated from stored data
* 🌐 **Responsive UI** using SvelteKit for modern UX

---

## Tech Stack

* **Frontend**: SvelteKit, JavaScript
* **Backend**: Node.js (Express)
* **Database**: MongoDB
* **Authentication**: OTP via Email/SMS (configurable)

---

## Setup & Installation

### Prerequisites

* Node.js v16+
* MongoDB instance (local or Atlas)

### Clone the Repository

```bash
git clone https://github.com/abdurrahmanshkh/voterdatamanager.git
cd voterdatamanager
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file and define the following:

```env
MONGO_URI=your_mongodb_uri
OTP_SECRET=your_otp_secret
BASE_URL=http://localhost:3000
```

### Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

---

## Usage

1. **Login with OTP** to access the dashboard.
2. **Upload CSV** files with voter details (name, age, ID, address, etc).
3. **Manage records** via Create, Read, Update, Delete interfaces.
4. **Download CSVs** for offline use or reporting.
5. **Generate voter slips** per individual or in bulk.
6. **Distribute unique links** to surveyors for remote data capture.

---

## Folder Structure

```
voter-dashboard/
├── backend/          # Node.js server and routes
├── frontend/         # SvelteKit UI
├── public/           # Static assets
├── utils/            # Helper functions (CSV parser, OTP, etc)
├── .env              # Environment configuration
└── README.md
```

---

## Deployment

You can deploy this project using:

* **Vercel** or **Netlify** for the frontend (SvelteKit)
* **Render**, **Heroku**, or **Railway** for the backend (Node.js)
* **MongoDB Atlas** for a managed database

---

## Contributing

Pull requests and issue reports are welcome. For major changes, please open an issue first to discuss what you'd like to change.

---

## License

This project is licensed under the [MIT License](LICENSE).
