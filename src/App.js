import "./App.css";
import React, { useRef, useState } from "react";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  //Initial config
  apiKey: "AIzaSyBa4Tfla1Xw7oRjo9XJ9pqi3LctP5BCx10",
  authDomain: "chat-687ee.firebaseapp.com",
  projectId: "chat-687ee",
  storageBucket: "chat-687ee.appspot.com",
  messagingSenderId: "304215079063",
  appId: "1:304215079063:web:0051b1ea64355fb0e051d2",
  measurementId: "G-Z1LYDCPEHZ",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <div>{user ? <>  <ChatRoom /> </> : <SignIn />}</div>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser() && (
      <button onClick={() => auth.signOut()}>Sign Out</button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();

  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    <button onClick={() => auth.signOut()}>Sign Out</button>
      <div>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <div ref={dummy}></div>
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />

        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid == auth.currentUser.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL} alt="" />
      <p>{text}</p>
    </div>
  );
}

export default App;
