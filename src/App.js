import React, { useState } from 'react';
import './App.css';

import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbprovider = new firebase.auth.FacebookAuthProvider();
  
  const [newUser, setNewUser] = useState(false)
  const [user,setUser] = useState({
    isLoggedIn : false,
    name : '' ,
    email : '' ,
    password : '' ,
    photo : '' ,
    error : '' ,
    success : false
  })

  const signInHandeler = () =>{
    firebase.auth().signInWithPopup(googleProvider)
    .then(res => {
      const {displayName,email,photoURL} = res.user
      const signedInUser = {
        isLoggedIn : true,
        name : displayName ,
        email : email ,
        photo : photoURL 
      }      
    })
  }

  const signOutHandeler = () =>{
    firebase.auth().signOut()
    .then(res => {
      const signOutUser = {
        isLoggedIn : false,
        name : '' ,
        email : '' ,
        photo : '' ,
        
      }
      setUser(signOutUser)
    })
    .catch(e => console.log(e))   
    
  }
  const handelBlur = (e) =>{
    let isFieldValid = true 
    if(e.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value)
      
    }
    if(e.target.name === 'password'){
      const passwordLength = e.target.value.length > 6
      const passwordHasNumber = /\d{1}/.test(e.target.value)
      isFieldValid = passwordHasNumber && passwordLength
    }

    if(isFieldValid){
      const newUserInfo = {...user}
      //const newUserInfos = user    //problem
      newUserInfo[e.target.name] = e.target.value
      setUser(newUserInfo)
    }
  }

  const submitHandeler = (e) =>{
    //console.log(user.email, user.password);
    if(newUser && user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo = {...user}
        newUserInfo.error = ''
        newUserInfo.success = true 
        setUser(newUserInfo)        
        updateUserInfo(user.name)
      }) 
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user}
        newUserInfo.error = error.message
        newUserInfo.success = false
        setUser(newUserInfo)
      });
    }
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo = {...user}
        newUserInfo.error = ''
        newUserInfo.success = true 
        setUser(newUserInfo)
        console.log('SignIn User Info',res.user);
      })
      .catch(function(error) {
       // Handle Errors here.
       const newUserInfo = {...user}
       newUserInfo.error = error.message
       newUserInfo.success = false
       setUser(newUserInfo)
      });
    }
    e.preventDefault()
  }

  const updateUserInfo = name =>{
    const user = firebase.auth().currentUser;
    user.updateProfile({
      displayName: name      
    }).then(function() {
      console.log('User name update successfully');
    }).catch(function(error) {
      console.log(error);
    });
  }
  const handleFbSignin = () =>{
    firebase.auth().signInWithPopup(fbprovider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      console.log("FB user after sign in", user);
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }
  return (
    <div className="App">
      {
        user.isLoggedIn ? <button onClick={signOutHandeler}>Sign Out</button>
                        :  <button onClick={signInHandeler}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignin}>Login with facebook</button>
      {
        user.isLoggedIn && <div>
          <p>Welcome, {user.name}</p>       
          <p>Email : {user.email}</p>
          <img src={user.photo}></img>
        </div>
      }
      <h1>Our own Authentication</h1>
      
      <input type="checkbox" onChange={()=>setNewUser(!newUser)} name="newUser" id=""></input>
      <label htmlFor="newUser">New User SignIn</label>
      <form onSubmit = {submitHandeler}>
        {newUser && <input name="name" type="text" onBlur={handelBlur} placeholder="Enter Name"></input>}<br/>
        <input type="email" required name="email" onBlur={handelBlur} placeholder="Enter email" ></input> <br/>
        <input type="password" name="password" onBlur={handelBlur} placeholder="Enter password"></input> <br/>
        <input type="submit" value={newUser ? 'Signup' : 'SignIn'} onClick={submitHandeler} ></input>
      </form>
    <p style={{color: 'red'}}>{user.error}</p>
    {user.success && <p style={{color: 'green'}}>User {newUser ? 'Created' : 'Logged in'} Successfully</p>}
    </div>
  );
}

export default App;
