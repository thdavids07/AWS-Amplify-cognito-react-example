import React from 'react';
import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, fetchUserAttributes, signUp } from '@aws-amplify/auth';
import { confirmSignUp, updatePassword } from 'aws-amplify/auth';
import { post, get } from 'aws-amplify/api'

import '@aws-amplify/ui-react/styles.css';

import { Hub } from 'aws-amplify/utils';

Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'signedIn':
      console.log('user have been signedIn successfully.');
      break;
    case 'signedOut':
      console.log('user have been signedOut successfully.');
      break;
    case 'tokenRefresh':
      console.log('auth tokens have been refreshed.');
      break;
    case 'tokenRefresh_failure':
      console.log('failure while refreshing auth tokens.');
      break;
    case 'signInWithRedirect':
      console.log('signInWithRedirect API has successfully been resolved.');
      break;
    case 'signInWithRedirect_failure':
      console.log('failure while trying to resolve signInWithRedirect API.');
      break;
    case 'customOAuthState':
      console.log('custom state returned from CognitoHosted UI');
      break;
  }
});

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

  // kijin42519@ekposta.com
  // Cl@ve123

  const [applicants, setapplicants] = React.useState([]);
  const [_backToken, set_backToken] = React.useState([]);
  const [_nextToken, set_nextToken] = React.useState([]);

  const [search_email, setsearch_email] = React.useState();

  async function listUsers(limit, flow) {

    const session = await fetchAuthSession();   // Fetch the authentication session
    var idtoken = session.tokens.idToken.toString()

    //?groupname=Supervisor
    let apiName = 'AdminQueries';
    let path = '/listUsers';
    let options = {
      queryParams: {
        "limit": limit
      },
      headers: {
        'Content-Type': 'application/json',
        //Authorization: `${(await fetchAuthSession()).tokens.accessToken.payload}`
        'Authorization': idtoken
      }
    }

    if(flow){
      options.queryParams.token = (flow == "back" ? _backToken : _nextToken)
    }

    if(search_email){
      options.queryParams.filter = "\"email\"^=\""+search_email+"\"";
    }

    //
    

    console.log(options)
    const { body } = await get({ apiName, path, options }).response
    const data = await body.json();

    set_nextToken(data.NextToken)

    console.log(data)

    setapplicants(data.Users);

    console.log(data.Users)
    console.log(JSON.stringify(data.Users))

  }

  async function listAdmins(limit, flow) {

    const session = await fetchAuthSession();   // Fetch the authentication session
    var idtoken = session.tokens.idToken.toString()

    //?groupname=Supervisor
    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let options = {
      queryParams: {
        "groupname": "tourist",
        "limit": limit
      },
      headers: {
        'Content-Type': 'application/json',
        //Authorization: `${(await fetchAuthSession()).tokens.accessToken.payload}`
        'Authorization': idtoken
      }
    }

    if(flow){
      options.queryParams.token = (flow == "back" ? _backToken : _nextToken)
    }

    console.log(options)
    const { body } = await get({ apiName, path, options }).response
    const data = await body.json();

    _nextToken = data.NextToken

    console.log(data)
    console.log(data.Users)
    console.log(JSON.stringify(data.Users))

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
    const [signup_passold, setsignup_passold] = React.useState('P@ssw0rd1');
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

    const services = {
      async handleSignUp(formData) {
        let { username, password, options } = formData;
  
        console.log(username)
        console.log(options.userAttributes)
  
        var data = options.userAttributes.emai
        // custom username
        //username = username.toLowerCase();
        //attributes.email = userAttributes.email.toLowerCase();
  
        username = data;
        return signUp({
          username,
          password,
          options : {
            autoSignIn: {
              enabled: true,
            },
            userAttributes : options.userAttributes
          }
        });
      },
    };

  function testsend(){

    var fileInput = document.getElementById("myfile");

    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("Authorization", "eyJraWQiOiJvY2pRTGplMEdmUjBmQlRRSzdFOTlSNEtaN1JIOStLeXVQKytzZXBGcFlBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlNzkzODFhOS03MTI0LTRkYWMtODc1OC01MzU1MDhlZjcwNDMiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfckNmQVZhUXNWIiwiY29nbml0bzp1c2VybmFtZSI6ImU3OTM4MWE5LTcxMjQtNGRhYy04NzU4LTUzNTUwOGVmNzA0MyIsIm9yaWdpbl9qdGkiOiJhMzgyYmQwMS02MjAzLTRkMGYtYTU3ZS0xYjE5ODFhODMxNTgiLCJhdWQiOiI2cGFmajlmamg0N2o0dnZuMm9rNmxvbWVjbyIsImV2ZW50X2lkIjoiM2FmMDRhNzQtOTkzNy00NzA0LWJiM2EtYWQ4MTA3YmI5MDViIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE3MTI2MDk3NTQsImV4cCI6MTcxMjYxMzM1NCwiaWF0IjoxNzEyNjA5NzU0LCJqdGkiOiJhYjkxM2JhZS1mZWFiLTQzYmMtYTRiMy1jNGE5ZWI4ZGU2ZWMiLCJlbWFpbCI6Im9kaHAxOTg5QGdtYWlsLmNvbSJ9.rw0o4TuWbB7amb9hn5tYT4fC1umXL0r5jUi38IjoR2d5d7JwkR8gvqkfCcgEBp6TCWcryXkhA39uKbm0PzigH6h-FBYGouxbgLcTfQnAkQ9LN4uuTcM6EDARyF24tV1Jb_4vZjNg_5TtwqObNVABmkFv5O5RbNOFYPTSylvh_TqypFh479MEj2qH0E2ezdxehyEWfSTFAPDpe-pUuqBu0z3jgUCYkSbEi4fyzJ-f8Ot0M6O_QRNJF4lDNdG2RXTszTxhQWBfk0ZKTu7Um3vcl5X5bby7SiL41f4-8tvYjhOaE8Lu4zhZkQ17-_S2WIpTSS3cgdjPEx4n-HlsEHedYw");
    
    const formdata = new FormData();
    formdata.append("departamentId", "1");
    formdata.append("userId", "1");
    formdata.append("districtId", "1");
    formdata.append("provinceId", "1");
    formdata.append("name", "Perritob");
    formdata.append("archivo", fileInput.files[0], "Oxabackground.jpg");
    formdata.append("fileId", "0");
    formdata.append("categories", "1");
    formdata.append("description", "DescriptionPerritob");
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow"
    };
    
    fetch("https://14evdujqvh.execute-api.us-east-1.amazonaws.com/prod/v1/anden/main/file/modify", requestOptions)
      .then((response) => response.text())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));

  }

  async function handleUpdatePassword() {

    console.log(signup_passold, signup_pass)

    try {
      await updatePassword({ oldPassword : signup_passold, newPassword : signup_pass });
    } catch (err) {
      console.log(err);
    }
  }
//  services={services}
  return (
    <Authenticator formFields={formFields}>
      {({ signOut, user }) => (
        <main>
          <div className="container-fluid">

            <h1>Hello {user.userId} - {user.username}</h1>
            <button className="btn btn-primary" onClick={signOut}>Sign out</button>
            <button className="btn btn-primary" onClick={printAccessTokenAndIdToken}>Get Token</button>
            <button className="btn btn-primary" onClick={printUserAttributes}>Get userdata</button>
            <button className="btn btn-primary" onClick={addToGroup}>Add to Group</button>
            <button className="btn btn-primary" onClick={() => listAdmins(2, 'back')}>Back</button>
            <button className="btn btn-primary" onClick={() => listAdmins(2, 'next')}>Next</button>
            
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
                      <button className="btn btn-primary" onClick={handleSignUpConfirmation}>Confirm registration</button>

                  </div>
                </div>
              </div>
            </div>

            
            <div className="card border-primary mt-3">
              <div className="card-header"><h5>Change password</h5></div>
              <div className="card-body">
                <div className="row">
                  <div className="col-6">
                      <div className="mb-3">
                        <label htmlFor="inp_pass" className="form-label">Old Password</label>
                        <input type="password" className="form-control" id="inp_pass" value={signup_passold} onChange={event => {setsignup_passold(event.target.value);}} />
                      </div>, 
                      <div className="mb-3">
                        <label htmlFor="inp_pass" className="form-label">New Password</label>
                        <input type="password" className="form-control" id="inp_pass" value={signup_pass} onChange={event => {setsignup_pass(event.target.value);}} />
                      </div>
                      <button className="btn btn-primary" onClick={() => handleUpdatePassword()}>Change password</button>
                    <p>
                      { signup_passold + ' | ' + signup_pass }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-primary mt-3">
              <div className="card-header">
                <button className="btn btn-primary" onClick={() => listUsers(3, null)}>List users</button>
              </div>
              <div className="card-body">

              <div className="mb-3">
                <label htmlFor="inp_user" className="form-label">Email</label>
                <input type="text" className="form-control" id="inp_searchemail" value={search_email} onChange={event => {setsearch_email(event.target.value);}} />
              </div>


              {applicants.map(function(user) {
                return (
                  <div key={user.id}>
                    <p>Id: {user.Username}</p>
                    <p>
                        <b>{user.Attributes.find(it => it.Name === 'name')?.Value}: {user.Attributes.find(it => it.Name === 'email')?.Value}</b>
                    </p>
                  </div>
                )
              })}

              </div>
              <div className="card-header">
                <button className="btn btn-primary" onClick={() => listUsers(3, 'back')}>Back</button>
                <button className="btn btn-primary" onClick={() => listUsers(3, 'next')}>Next</button>
              </div>
            </div>

          </div>

          <div>
            <input id="myfile" type='file' name="myfile"></input>
            <button onClick={testsend}>Test send</button>
          </div>

        </main>
      )}
    </Authenticator>
  );
}

export default App;
