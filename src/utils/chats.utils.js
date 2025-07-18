import { addChat } from '../utils/handle_request.utils';

export const handleNewChat = async (setChats, setSelectedChat) => {
    try {
        const response = await addChat('/api/chats');
        console.log("New Chat Response: ", response.data.chat);
        let newChat = response.data.chat;
        if (response.success) {
            setChats((prevChats) => [...prevChats, newChat]);
            setSelectedChat(newChat);
            return newChat;
        } else {
            console.error('Error adding chat:', response.error);
        }
    } catch (error) {
        console.error('Error adding chat:', error);
    }
    return null;
};