import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel, Message } from "@/types";

interface ChatState {
    channels: Channel[];
    messages: Message[];
    currentChannel: string | null;
}

const initialState: ChatState = {
    messages: [],
    channels: [
        { id: 'general', name: 'Genel Sohbet' },
        { id: 'channel-1', name: 'Kanal 1' },
    ],
    currentChannel: 'general',
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        setCurrentChannel: (state, action: PayloadAction<string>) => {
            state.currentChannel = action.payload;
        },
    },
});

export const { addMessage, setCurrentChannel } = chatSlice.actions;
export default chatSlice.reducer;