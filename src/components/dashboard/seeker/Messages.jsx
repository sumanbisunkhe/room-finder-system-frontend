import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import {
  sendMessage,
  markAsRead,
  deleteMessage,
  getConversation,
  getUnreadMessages,
  getDirectConversations
} from '../../../services/messageService';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getDirectConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await getConversation(conversationId);
      setMessages(response.data);
      markMessagesAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      await markAsRead(conversationId);
      updateUnreadCount(conversationId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const updateUnreadCount = (conversationId) => {
    setConversations(prevConversations =>
      prevConversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await sendMessage({
        conversationId: selectedConversation.id,
        content: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Messages
      </Typography>

      <Paper sx={{ display: 'flex', height: '600px' }}>
        {/* Conversations List */}
        <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Box>
          <Divider />
          <List sx={{ overflow: 'auto', height: 'calc(100% - 72px)' }}>
            {filteredConversations.map((conv) => (
              <ListItem
                key={conv.id}
                button
                selected={selectedConversation?.id === conv.id}
                onClick={() => setSelectedConversation(conv)}
              >
                <ListItemAvatar>
                  <Avatar>{conv.participant.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={conv.participant.name}
                  secondary={conv.lastMessage?.content}
                  primaryTypographyProps={{
                    fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal'
                  }}
                />
                {conv.unreadCount > 0 && (
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    {conv.unreadCount}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Messages Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {selectedConversation.participant.name}
                </Typography>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message) => (
                  <Stack
                    key={message.id}
                    direction="row"
                    spacing={1}
                    justifyContent={message.isSender ? 'flex-end' : 'flex-start'}
                    mb={2}
                  >
                    {!message.isSender && (
                      <Avatar>{selectedConversation.participant.name[0]}</Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: message.isSender ? 'primary.main' : 'grey.100',
                        color: message.isSender ? 'white' : 'inherit'
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {new Date(message.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                    {message.isSender && (
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="textSecondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Messages; 