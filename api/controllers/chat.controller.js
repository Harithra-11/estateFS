import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const tokenUserId = req.userId;
  
    try {
      const chats = await prisma.chat.findMany({
        where: {
          userIDs: {
            hasSome: [tokenUserId],
          },
        },
      });
  
      for (const chat of chats) {
        const receiverId = chat.userIDs.find((id) => id !== tokenUserId);
        
        if (!receiverId) {
          continue; // Skip if no receiver found
        }
  
        const receiver = await prisma.user.findUnique({
          where: {
            id: receiverId,
          },
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        });
        chat.receiver = receiver;
      }
  
      res.status(200).json(chats);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get chats!" });
    }
  };
  

  export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
  
    try {
      const chat = await prisma.chat.findUnique({
        where: {
          id: req.params.id,
          userIDs: {
            hasSome: [tokenUserId],
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
  
      if (!chat) {
        return res.status(404).json({ message: "Chat not found!" });
      }
  
      await prisma.chat.update({
        where: {
          id: req.params.id,
        },
        data: {
          seenBy: {
            set: Array.from(new Set([...chat.seenBy, tokenUserId])), // Ensure unique values
          },
        },
      });
  
      res.status(200).json(chat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to get chat!" });
    }
  };
  

  





  export const addChat = async (req, res) => {
    const tokenUserId = req.userId;
    const receiverId = req.body.receiverId;
  
    // Validate receiverId
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required!" });
    }
  
    try {
      const newChat = await prisma.chat.create({
        data: {
          userIDs: [tokenUserId, receiverId],
        },
      });
      res.status(200).json(newChat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to add chat!" });
    }
  };
  
  export const readChat = async (req, res) => {
    const tokenUserId = req.userId;
  
    try {
      const chat = await prisma.chat.findUnique({
        where: {
          id: req.params.id,
          userIDs: {
            hasSome: [tokenUserId],
          },
        },
      });
  
      if (!chat) {
        return res.status(404).json({ message: "Chat not found!" });
      }
  
      const updatedChat = await prisma.chat.update({
        where: {
          id: req.params.id,
        },
        data: {
          seenBy: {
            set: Array.from(new Set([...chat.seenBy, tokenUserId])),
          },
        },
      });
  
      res.status(200).json(updatedChat);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to read chat!" });
    }
  };
  