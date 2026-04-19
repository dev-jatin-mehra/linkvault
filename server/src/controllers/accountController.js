import { deleteAccountForUser } from "../services/accountService.js";

export const deleteAccountHandler = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const result = await deleteAccountForUser(userId);
    res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to delete account. Please try again.",
    });
  }
};
