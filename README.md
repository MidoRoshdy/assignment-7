# Assignment 7 - Sequelize + Express API

## Setup

1. Install dependencies:
   npm install
2. Configure your MySQL credentials using environment variables (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `PORT`).
3. Run the server:
   npm run dev

## Endpoints

### User
- POST `/users/signup`
- PUT `/users/:id`
- GET `/users/by-email?email=user1@gmail.com`
- GET `/users/:id`

### Post
- POST `/posts`
- DELETE `/posts/:postId`
- GET `/posts/details`
- GET `/posts/comment-count`

### Comment
- POST `/comments`
- PATCH `/comments/:commentId`
- POST `/comments/find-or-create`
- GET `/comments/search?word=the`
- GET `/comments/newest/:postId`
- GET `/comments/details/:id`
