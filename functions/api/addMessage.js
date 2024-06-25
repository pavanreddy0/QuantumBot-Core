const admin = require("firebase-admin");
const functions = require("firebase-functions");

const { logger } = functions;

exports.addMessage = functions.https.onCall(async (data, context) => {
  try {
    logger.log("Received message request data", data);

    // valiate data
    if (!data || !data.text || !data.userId) {
      logger.error("Required fields(text or userId) are missing");
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Required fields(text or userId) are missing"
      );
    }

    const { text, userId } = data;

    //   construct message data
    const messageData = {
      text,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    //   Add message to users message sub collection in Firestore
    const messageRef = await admin
      .firestore()
      .collection("chats")
      .doc(userId)
      .collection("messages")
      .add(messageData);

    logger.log("Message successfully added ", messageRef.id);

    //   return success status and message id
    return { success: true, messageId: messageRef.id };
  } catch (error) {
    logger.error("Error adding message", error);

    // Throw structured error for the client
    throw new functions.https.HttpsError(
      "unknown",
      "An error occured while adding message ",
      error.message
    );
  }
});
