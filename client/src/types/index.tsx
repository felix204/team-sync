export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface Message {
    id: string;
    content: string;
    userId: string;
    timestamp: string;
    channelId: string;
}

export interface Channel {
    id: string;
    name: string;
    description?: string;
}