// src/controllers/collectionMemberController.js

// Add a member to a collection
const addMember = async (req, res) => {
    try {
      const { collectionId } = req.params;
      const { userId, role } = req.body;
  
      if (!userId || !role) {
        return res.status(400).json({ error: "userId and role are required" });
      }
  
      // For now we fake persistence (later will be DB integration)
      const newMember = {
        id: Date.now().toString(), // mock id
        collectionId,
        userId,
        role,
      };
  
      return res.status(201).json({
        message: "Member added successfully",
        member: newMember,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  
  // Update a member's role
  const updateMemberRole = async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
      const { role } = req.body;
  
      if (!role) {
        return res.status(400).json({ error: "role is required" });
      }
  
      return res.json({
        message: "Member role updated successfully",
        member: { id: memberId, collectionId, role },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  
  // Remove a member from a collection
  const removeMember = async (req, res) => {
    try {
      const { collectionId, memberId } = req.params;
  
      return res.json({
        message: "Member removed successfully",
        member: { id: memberId, collectionId },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  
  // List all members in a collection
  const listMembers = async (req, res) => {
    try {
      const { collectionId } = req.params;
  
      // Mock response
      const members = [
        { id: "1", userId: "100", role: "owner", collectionId },
        { id: "2", userId: "101", role: "editor", collectionId },
      ];
  
      return res.json({ members });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };
  
  // ✅ Export all controllers properly
  module.exports = {
    addMember,
    updateMemberRole,
    removeMember,
    listMembers,
  };
  