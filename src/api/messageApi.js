import api from "./axios";

export const sendMessage = async (receiverId, content, sharedPostId, image) => {
    if (!receiverId) throw new Error("Receiver ID is required");
    if (image) {
        const formData = new FormData();
        formData.append("receiverId", receiverId);
        if (content) formData.append("content", content);
        if (sharedPostId) formData.append("sharedPostId", sharedPostId);
        formData.append("image", image);

        const response = await api.post("/messages", formData);
        return response.data;
    } else {
        const response = await api.post("/messages", { receiverId, content, sharedPostId });
        return response.data;
    }
};


export const getConversations = async () => {
    const response = await api.get("/messages/conversations");
    return response.data;
};

export const getMessages = async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
};
