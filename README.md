# Social Network Backend

This is the backend for the Social Network app, built using Express.js and MongoDB.

## Features

### Authentication
- Register a new user
- Login and receive access/refresh tokens
- Refresh access token
- Logout user

### User Management
- Retrieve authenticated user's profile
- Retrieve another user's profile by ID
- Update user profile (including avatar, bio, location, and other details)

### Social Interactions
- Follow another user
- Unfollow a user
- Get a list of followers
- Get a list of followings

### Posts Management
- Create a new post
- Retrieve all posts (with optional user filtering)
- Retrieve posts from followed users
- Retrieve a post by ID
- Delete a post by ID
- Like a post
- Unlike a post

### Comments Management
- Add a comment to a post
- Delete a comment by ID
- Retrieve comments for a specific post

### Middleware & Security
- Authentication with JWT (JSON Web Token)
- Authorization middleware to protect routes
- Validation middleware for request data
- Error handling for consistent API responses

## Technologies Used

- Node.js
- TypeScript
- Express.js
- MongoDB & Mongoose
- Redis

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/makstsar17/social-network-api.git
   cd social-network-api
   ```

2. Install dependencies using npm or yarn:

   ```sh
   npm install
   ```

   or

   ```sh
   yarn install
   ```

3. Create a `.env` file in the root directory. You can use the provided `.env.example` file as a template:

   ```sh
   cp .env.example .env
   ```

   Then, update the `.env` file with your configuration:

   ```env
   PORT=your_server_port
   MONGO_URI=your_mongodb_connection_string
   JWT_ACCESS_SECRET_KEY=your_jwt_secret
   JWT_REFRESH_SECRET_KEY=your_refresh_token_secret
   REDIS_URI=your_redis_connection_string
   FRONTEND_URL=your_frontend_url
   ```

4. Build and start the server:

   ```sh
   npm run build
   npm start
   ```

   or

   ```sh
   yarn build
   yarn start
   ```

   For development mode with hot-reloading:

   ```sh
   npm run dev
   ```

   or

   ```sh
   yarn dev
   ```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get access/refresh tokens
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - Logout user

### Users

- `GET /users/` - Get current authenticated user
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile (including avatar, bio, location, etc.)
- `PATCH /users/follow/:id` - Follow a user
- `PATCH /users/unfollow/:id` - Unfollow a user
- `GET /users/followers` - Get followers of the authenticated user
- `GET /users/followings` - Get followings of the authenticated user

### Posts

- `POST /posts` - Create a new post
- `GET /posts` - Get all posts (with optional user filtering)
- `GET /posts/following` - Get posts from followed users
- `GET /posts/:id` - Get a post by ID
- `DELETE /posts/:id` - Delete a post by ID
- `PATCH /posts/like/:id` - Like a post
- `PATCH /posts/unlike/:id` - Unlike a post

### Comments

- `POST /comments` - Add a comment to a post
- `DELETE /comments/:id` - Delete a comment by ID
- `GET /comments` - Get comments for a specific post

## Demo



## License

This project is licensed under the MIT License.

