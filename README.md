# LEDEMS - backend
<p>LEDEMS is short for: Law Enforcement Digital Evidence Management System.</p>
LEDEMS is a web application for law enforcement officers to upload, view, and manage digital evidence related to suspects. The application allows officers to securely log in, upload various digital assets (e.g., images, videos, documents) associated with a suspect, and manage the evidence in a structured manner.

## How to run this project

- Install dependecies:
<pre><code>npm i</code></pre>

- Add to the root folder a file called ```.env``` and in that file add these variables: 
 ```bash
 HOST="your host URL"
SECRET_KEY="your secret key"
  ```

- Start the application:
<pre><code>npm start</code></pre>

## Technologies
- Node.js
- Express
- PostgreSQL
- Bcrypt
- JWT
