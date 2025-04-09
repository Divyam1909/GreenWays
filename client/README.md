# GreenWays Frontend

A modern React application to help users plan eco-friendly transportation routes.

## Mock API Mode

The application has been configured to run in "mock API mode" which disables all backend API calls and uses mock data instead. This is useful for:
- Testing and development of the frontend interface without needing a backend
- Demonstration purposes
- UI/UX testing

The mock data includes:
- Sample route options with different transportation modes
- Environmental impact statistics
- User authentication (mock login/registration)
- Route saving and retrieval

## Running the Application

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm start
```

The application will run on [http://localhost:3000](http://localhost:3000) with mock API enabled.

## Mock API Configuration

The mock API mode is controlled by the `MOCK_API` flag in `src/services/api.ts`. It is currently set to `true` to disable all backend calls.

If you want to re-enable the backend integration:
1. Set `MOCK_API` to `false` in `src/services/api.ts`
2. Ensure your backend server is running at the URL specified in your `.env` file or at the default `http://localhost:5000/api`

## Features

- Route planning with multiple transportation options
- Carbon emission calculations and comparisons
- Interactive maps with route visualization
- User authentication (login/registration)
- Route saving and history

## Testing the Frontend

With mock API mode enabled, you can test all frontend functionality:

1. **Authentication**: Use any email/password to "log in" - the system will use mock user data
2. **Route Planning**: Enter any origin and destination to get mock route options
3. **Saving Routes**: Save routes to see them in your route history
4. **UI/UX Flow**: Test the complete user flow without any backend dependencies

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects the create-react-app configuration

## Technologies Used

- React
- TypeScript
- Material UI
- Framer Motion
- Google Maps API
- Axios (for API calls when not in mock mode)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
