import React from 'react';
import ReactDOM from 'react-dom/client';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// AWS
import {Amplify, Auth} from 'aws-amplify';

Amplify.configure({
  Auth: {
    /*Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: 'us-east-1_8Xt83nKdT',
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: '2i3hh341oi5iktb6qvk2kkqmfq',
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: 'us-east-1:9097a7b7-c660-4463-8abe-89afd3eaa4c8',
    },*/
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: 'us-east-1_8Xt83nKdT',
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: '4l0qlic8ua618css4suak9gfoi',
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      identityPoolId: 'us-east-1:9097a7b7-c660-4463-8abe-89afd3eaa4c8',
    },
  },
});

// You can get the current config object
const currentConfig = Amplify.getConfig();


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
