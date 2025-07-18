import { addChat } from '../utils/handle_request.utils';

export const handleNewChat = async (setChats, setSelectedChat, setsetCreatingNewChat) => {
    try {
        setsetCreatingNewChat(true);
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
        setsetCreatingNewChat(false);
    } catch (error) {
        console.error('Error adding chat:', error);
        setsetCreatingNewChat(false);
    }
    return null;
};