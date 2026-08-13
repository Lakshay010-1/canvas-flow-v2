<h1>Backend</h1>
<h1>Canvas Flow v2 Backend</h1>
<h2>This backend provides a social media-like API for artists, where users can create and share canvases, interact via likes and comments, and subscribe to their favorite creators</h2>
<br/>
<h3>Features:</h3>
<ol>
    <li>User Management
        <ul>
            <li>Register, login, and session-based authentication.</li>
            <li>Secure password hashing with bcrypt.</li>
            <li>Profile images stored in Cloudinary.</li>
        </ul>
    </li>
    <br>
    <li>Canvas Management
        <ul>
            <li>Artists can upload and update canvases (binary image data stored as BYTEA in PostgreSQL).</li>
            <li>Tracks view counts, timestamps, and ownership.</li>
        </ul>
    </li>
    <br>
    <li>Likes & Comments
        <ul>
            <li>Users can like/unlike both canvases and comments.</li>
            <li>Fetch a user’s liked canvases and comments.</li>
            <li>Commenting system linked to canvases and users.</li>
        </ul>
    </li>
    <br>
    <li>Subscriptions (Channels)
        <ul>
            <li>Follow/unfollow system for channels (users).</li>
            <li>Fetch subscribers of a channel and channels a user is subscribed to.</li>
            <li>Check and toggle subscription status.</li>
        </ul>
    </li>
    <br>
    <li>Middleware & Security
        <ul>
            <li>Auth-protected routes using verifyUser middleware.</li>
            <li>CORS-enabled APIs for frontend communication.</li>
            <li>Centralized error handling with custom apiError and apiResponse classes.</li>
        </ul>
    </li>
    <br>
    <li>Logging & Monitoring
        <ul>
            <li>morgan for HTTP request logs.</li>
            <li>winston for structured logging.</li>
        </ul>
    </li>
</ol>
<br/>
