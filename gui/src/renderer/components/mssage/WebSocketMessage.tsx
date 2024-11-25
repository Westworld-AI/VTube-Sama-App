import React, { useState, useEffect } from 'react';
import WebSocketClient from 'renderer/features/websocket/webSocketClient';

const WebSocketMessage: React.FC = () => {
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const webSocketClient = new WebSocketClient(
      'ws://localhost:8001/ws',
      // Message received callback
      (msg) => {
        console.log('Message received from server: ', msg);
      },
      // Error occurred callback
      (error) => {
        console.error('WebSocket error: ', error);
      }
    );
    setClient(webSocketClient);

    // Disconnect client when component unmounts
    return () => {
      webSocketClient.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    client?.sendMessage('/app/message', JSON.stringify({ message }));
  };

  return (
    <div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
};

export default WebSocketMessage;
