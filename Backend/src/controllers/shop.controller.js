import Link from "../models/link.model.js";

// Create a new link
export const createShop = async (req, res) => {
  try {
    const { title, url } = req.body;
    const userId = req.user.id; // Assuming user authentication

    if (!title || !url) {
      return res.status(400).json({ message: "Title and URL are required" });
    }

    const newLink = new Link({ title, url, userId });
    await newLink.save();

    res.status(201).json({ message: "Link created successfully", link: newLink });
  } catch (error) {
    res.status(500).json({ message: "Error creating link", error: error.message });
  }
};

// Get all links for a user
export const getUserShopLinks = async (req, res) => {
  try {
    const userId = req.user.id;
    const links = await Link.find({ userId });

    res.json(links);
  } catch (error) {
    res.status(500).json({ message: "Error fetching links", error: error.message });
  }
};

// Delete a link
export const deleteShop = async (req, res) => {
  try {
    const { linkId } = req.params;
    const deletedLink = await Link.findByIdAndDelete(linkId);

    if (!deletedLink) return res.status(404).json({ message: "Link not found" });

    res.json({ message: "Link deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting link", error: error.message });
  }
};
