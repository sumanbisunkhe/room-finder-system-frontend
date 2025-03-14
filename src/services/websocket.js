// import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client';

// let stompClient = null;

// // export const connectToWebSocket = ({ token, onMessageReceived, onError }) => {
// //   const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws`);
// //   const client = new Client({
// //     webSocketFactory: () => socket,
// //     reconnectDelay: 5000,
// //     heartbeatIncoming: 4000,
// //     heartbeatOutgoing: 4000,
// //     connectHeaders: {
// //       Authorization: `Bearer ${token}`
// //     },
// //     onConnect: (frame) => {
// //       // Subscribe to the user's private queue
// //       client.subscribe(`/user/queue/messages`, (message) => {
// //         if (onMessageReceived) {
// //           const parsedMessage = JSON.parse(message.body);
// //           onMessageReceived(parsedMessage);
// //         }
// //       });
// //     },
// //     onStompError: (frame) => {
// //       if (onError) {
// //         onError(frame.headers.message || 'WebSocket error');
// //       }
// //     },
// //   });

// //   client.activate();
// //   return client;
// // };

// export const connectToWebSocket = ({ 
//   token, 
//   onMessageReceived, 
//   onError, 
//   setConnectionStatus 
// }) => {
//   // Add token to query parameters
//   const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws?token=${token}`, null, { 
//     withCredentials: true 
//   });
  
//   const client = new Client({
//     webSocketFactory: () => socket,
//     reconnectDelay: 5000,
//     heartbeatIncoming: 4000,
//     heartbeatOutgoing: 4000,
//     debug: (str) => console.debug('STOMP:', str),
//     onConnect: (frame) => {
//       console.log('Connected:', frame);
//       setConnectionStatus('connected');
      
//       // Subscribe to user-specific queues
//       client.subscribe(`/user/queue/messages`, onMessageReceived);
//       client.subscribe(`/user/queue/errors`, (message) => {
//         const error = JSON.parse(message.body);
//         onError(error.message);
//       });
//     },
//     onStompError: (frame) => {
//       console.error('STOMP Error:', frame.headers.message);
//       onError(frame.headers.message || 'STOMP protocol error');
//     },
//     onWebSocketError: (event) => {
//       console.error('WebSocket Error:', event);
//       onError('Connection error. Trying to reconnect...');
//     }
//   });

//   client.activate();
//   return client;
// };

// export const sendMessageViaWebSocket = (message) => {
//   if (stompClient && stompClient.connected) {
//     stompClient.publish({
//       destination: "/app/chat.send",
//       body: JSON.stringify(message)
//     });
//     return true;
//   } else {
//     console.error("WebSocket connection not established");
//     return false;
//   }
// };

// export const sendTypingNotification = (username) => {
//   if (stompClient && stompClient.connected) {
//     // Send plain text payload for typing event as expected by the backend
//     stompClient.publish({
//       destination: "/app/chat.typing",
//       body: username
//     });
//     return true;
//   } else {
//     console.error("WebSocket connection not established");
//     return false;
//   }
// };

// export const subscribeToRoom = (roomId, onRoomMessage) => {
//   if (stompClient && stompClient.connected) {
//     return stompClient.subscribe(`/topic/room.${roomId}`, (message) => {
//       if (onRoomMessage) {
//         onRoomMessage(JSON.parse(message.body));
//       }
//     });
//   } else {
//     console.error("WebSocket connection not established");
//     return null;
//   }
// };

// export const disconnectWebSocket = () => {
//   if (stompClient) {
//     stompClient.deactivate();
//     stompClient = null;
//   }
// };
