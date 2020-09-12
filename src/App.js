import React, { useState } from 'react';
import './App.css';

import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig);

function App() {
  const provider = new firebase.auth.GoogleAuthProvider();

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
    firebase.auth().signInWithPopup(provider)
    .then(res => {
      const {displayName,email,photoURL} = res.user
      const signedInUser = {
        isLoggedIn : true,
        name : displayName ,
        email : email ,
        photo : photoURL 
      }
      setUser(signedInUser)
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
    if(user.email && user.password){
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
      .then(res =>{
        const newUserInfo = {...user}
        newUserInfo.error = ''
        newUserInfo.success = true 
        setUser(newUserInfo)
      }) 
      .catch(error => {
        // Handle Errors here.
        const newUserInfo = {...user}
        newUserInfo.error = error.message
        newUserInfo.success = false
        setUser(newUserInfo)
      });
    }
    e.preventDefault()
  }
  return (
    <div className="App">
      {
        user.isLoggedIn ? <button onClick={signOutHandeler}>Sign Out</button>
                        :  <button onClick={signInHandeler}>Sign In</button>
      }
      {
        user.isLoggedIn && <div>
          <p>Welcome, {user.name}</p>          
          <p>Email : {user.email}</p>
          <img src={user.photo}></img>
        </div>
      }
      <h1>Our own Authentication</h1>
      
      <form onSubmit = {submitHandeler}>
        <input name="name" type="text" onBlur={handelBlur} placeholder="Enter Name"></input><br/>
        <input type="email" required name="email" onBlur={handelBlur} placeholder="Enter email" ></input> <br/>
        <input type="password" name="password" onBlur={handelBlur} placeholder="Enter password"></input> <br/>
        <input type="submit" onClick={submitHandeler} ></input>
      </form>
    <p style={{color: 'red'}}>{user.error}</p>
    {user.success && <p style={{color: 'green'}}>User Created Successfully</p>}
    </div>
  );
}

export default App;
