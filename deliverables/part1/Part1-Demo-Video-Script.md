# COMP229 Project Part 1 Demo Video Script

Target length: 6 to 8 minutes. Speak naturally; do not read every word exactly.

## 0:00 - 0:30 | Title slide

Hello, my name is Amir Saad, student ID 301473849. This is my COMP229 Web Application Development Project Part 1 demo. My project is currently named LifeReady Training. It is an original MERN application for managing First Aid, CPR/AED, and Basic Life Support training classes. I am completing the project independently with professor approval.

## 0:30 - 1:10 | Part 1 scope

For Part 1, the application does not need to be visually complete yet. The focus is the database connection, Node and Express backend, MVC structure, authentication, authorization, and CRUD API testing. The React frontend and polished class-browsing pages will be completed in Part 2.

## 1:10 - 1:50 | Database and collections

I created a MongoDB Atlas project and connected it to my Express application through environment variables. The application uses two main collections. The User collection stores name, email, a salted password hash, role, and timestamps. The TrainingClass collection stores a title, category, class date, location, capacity, price, instructor, status, and the administrator who created the record.

Show: MongoDB Atlas cluster or Data Explorer. Do not show passwords, connection strings, or tokens.

## 1:50 - 2:40 | MVC backend structure

The backend follows MVC. The models define the MongoDB schema and validation. Controllers contain the CRUD logic. Route files map HTTP requests to controller functions. The Express server registers the routes and includes a health check endpoint.

Show: `server/models`, `server/controllers`, and `server/routes` folders in VS Code.

## 2:40 - 3:30 | Authentication and authorization

Users can create an account and sign in through the authentication API. A successful sign-in returns a JSON Web Token. The token protects profile routes. The project also uses roles: regular users are students by default, while administrators can manage training classes. The code prevents a public sign-up request from creating an administrator role.

Show: `auth.controller.js`, especially token creation and `requireAdmin`. Briefly point out the comments.

## 3:30 - 5:30 | Thunder Client CRUD demonstration

I will now demonstrate the project-specific CRUD object, TrainingClass.

First, I sign in as an administrator. The response is 200 OK and returns a token. I add the token as a Bearer token in Thunder Client.

Next, I send a POST request to create a Basic Life Support training class. The response is 201 Created and includes the new class ID.

Then, I send a GET request to list all training classes. The new class appears in the response. I can also use the ID in a GET request to read one class.

Next, I send a PUT request to update the class capacity and price. The response is 200 OK and shows the new values.

Finally, I send a DELETE request using the class ID. The response confirms that the class was deleted. A final GET list request confirms that it no longer appears.

Show: Thunder Client Create, Read, Update, and Delete results. Hide the token and password values before recording.

## 5:30 - 6:20 | User CRUD and security test

I also tested the User API. A user can create an account, sign in, read their own profile, update profile details, and delete their own account. I tested authorization by using a student token to attempt to create a training class. The API correctly returns 403 Forbidden because only an administrator can manage class records.

Show: User create result and the student 403 response, with sensitive fields hidden.

## 6:20 - 7:00 | Documentation and next release

For project management, I created a Product Backlog and Task Board. I also created the first version of the External Design Document, including the project logo, database design, API test plan, and wireframes for the future landing page, class listing, authentication, and administrator management pages.

In Part 2, I will connect the React frontend to these APIs, add the public landing page and navigation, and make the application visually polished. Thank you.

## Recording checklist

- Use the two-slide PowerPoint at the beginning of the video.
- Keep the recording between 5 and 10 minutes.
- Show code and Thunder Client at readable zoom.
- Hide passwords, JWT tokens, and the MongoDB connection string.
- Upload the completed video to YouTube or another streaming service and submit its link.
