import { useEffect, useRef, useState } from 'react'
import './App.css'

import * as signalR from '@microsoft/signalr'

function App() {
  const [value, setValue] = useState('')

  const connection = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    connection.current = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5217/gameHubs")
      .build();

    connection.current.on("messageReceived", (message: string) => {
      console.log("Message received: ", message);
    });

    connection.current.start()
      .then(() => console.log("Connection started"))
      .catch(err => console.error("Error while starting connection: ", err));

  }, [])

  return (
    <>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <p>Current value: {value}</p>
      <button onClick={() => {
        connection.current?.send("newMessage", 2234234, value).then(() => {
          console.log("Message sent: ", value);
          setValue('');
        }).catch(err => console.error("Error while sending message: ", err));
      }}>Clear</button>
    </>
  )
}

export default App
