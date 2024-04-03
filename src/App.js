import React from 'react';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes, signUp } from '@aws-amplify/auth';
import { confirmSignUp } from 'aws-amplify/auth';
import { post, get } from 'aws-amplify/api'

import '@aws-amplify/ui-react/styles.css';

const formFields = {
  signUp: {
    email: {
      order: 1
    },
    password: {
      order: 2
    },
    confirm_password: {
      order: 3
    }
  }
}

/*
const formFields = {
  signUp: {
    email: {
      order:1
    },
    password: {
      order: 2
    },
    confirm_password: {
      order: 3
    },
    nickname : {
      order: 4
    },
    gender : {
      order: 5
    },
    phone_number : {
      order: 6
    },
    address : {
      order: 7
    },
    name : {
      order: 8
    }
  }
}
*/

function App() {


  // Function to print access token and id token
  const printAccessTokenAndIdToken = async () => {
    try {
      const session = await fetchAuthSession();   // Fetch the authentication session
      console.log('Access Token:', session.tokens.accessToken.toString());
      console.log('ID Token:', session.tokens.idToken.toString());
    }
    catch (e) { console.log(e); }
  };

  const printUserAttributes = async () => {
    try {
      const userAttributes = await fetchUserAttributes();
      console.log({ email: userAttributes })
    }
    catch (e) { console.log(e); }
  };

  // https://docs.amplify.aws/javascript/build-a-backend/auth/admin-actions/
  // User: david123
  // Pass: Cl@ve123

  async function listAdmins(limit) {

    const session = await fetchAuthSession();   // Fetch the authentication session
    var idtoken = session.tokens.idToken.toString()

    //?groupname=Supervisor
    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let options = {
      queryParams: {
        "groupname": "Supervisor",
        "limit": 2
      },
      headers: {
        'Content-Type': 'application/json',
        //Authorization: `${(await fetchAuthSession()).tokens.accessToken.payload}`
        'Authorization': idtoken
      }
    }
    console.log(options)
    const { body } = await get({ apiName, path, options }).response
    const data = await body.json();
    console.log(data.Users)
  }

  async function addToGroup() {

    const session = await fetchAuthSession();   // Fetch the authentication session
    var idtoken = session.tokens.idToken.toString()

    let apiName = 'AdminQueries';
    let path = '/addUserToGroup';
    let options = {
      body: {
        "username": "pigmdnuhhbpdtpqyjk@cazlg.com",
        "groupname": "Admin"
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': idtoken
      }
    }


    const { body } = await post({ apiName, path, options }).response
    const data = await body.json();
    console.log(data)
  }

  // https://docs.amplify.aws/javascript/build-a-backend/auth/enable-sign-up/
    
    async function signUpUser() {
      try {

        const { isSignUpComplete, userId, nextStep } = await signUp({
          username: signup_user,
          password: signup_pass,
          options: {
            userAttributes: {
              email: signup_email

            },
            autoSignIn: true // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
          }
        })

        alert("Registered correctly")

      } catch (error) {
        console.log('error signing up:', error);
      }
    }

    const [signup_user, setsignup_user] = React.useState('myuser');
    const [signup_email, setsignup_email] = React.useState('o.huertas@ovenfo.com');
    const [signup_pass, setsignup_pass] = React.useState('P@ssw0rd1');
    const [signup_confirm, setsignup_confirm] = React.useState('');

    async function handleSignUpConfirmation() {
      try {

        const { isSignUpComplete, nextStep } = await confirmSignUp({
          username : signup_user,
          confirmationCode : signup_confirm
        });

        alert("Confirmed correctly")

      } catch (error) {
        console.log('error confirming sign up', error);
      }
    }

  return (
    <Authenticator formFields={formFields}>
      {({ signOut, user }) => (
        <main>
          <div className="container-fluid">

            <h1>Hello {user.userId} - {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
            <button onClick={printAccessTokenAndIdToken}>Get Token</button>
            <button onClick={printUserAttributes}>Get userdata</button>
            <button onClick={addToGroup}>Add to Group</button>
            <button onClick={() => listAdmins(10)}>List Admins</button>
            

            <div className="card border-primary mt-3">
              <div className="card-header"><h5>Cognito Sign Up</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                    <form>
                      <div className="mb-3">
                        <label htmlFor="inp_user" className="form-label">Username</label>
                        <input type="text" className="form-control" id="inp_user" value={signup_user} onChange={event => {setsignup_user(event.target.value);}} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="inp_email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="inp_email" value={signup_email} onChange={event => {setsignup_email(event.target.value);}} />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="inp_pass" className="form-label">Password</label>
                        <input type="password" className="form-control" id="inp_pass" value={signup_pass} onChange={event => {setsignup_pass(event.target.value);}} />
                      </div>
                      <button className="btn btn-primary" onClick={() => signUpUser()}>signUp a user</button>
                    </form>
                    <p>
                      { signup_user + ' | ' + signup_email + ' | ' + signup_pass }
                    </p>
                  </div>
                  <div className="col-6">
                    
                      <div className="mb-3">
                        <label htmlFor="inp_confirm" className="form-label">Confirmation code</label>
                        <input type="text" className="form-control" id="inp_confirm" value={signup_confirm} onChange={event => {setsignup_confirm(event.target.value);}} />
                      </div>
                      <button className="btn btn-primary" onClick={() => handleSignUpConfirmation()}>Confirm registration</button>

                  </div>
                </div>
              </div>
              <div className="card-footer">data</div>
            </div>

          </div>

        </main>
      )}
    </Authenticator>
  );
}

export default App;
