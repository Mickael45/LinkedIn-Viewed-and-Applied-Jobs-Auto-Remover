import { SignedInSessionResource, UserResource } from "@clerk/types";

const EXTENSION_ID = "pdmlnfggfnomjdenapbgaehgbbmaaofg";

const isChromeApiAvailable = () =>
  window.chrome && chrome.runtime && chrome.runtime.sendMessage;

const sendMessageToExtension = (
  message: {
    type: string;
    token?: string | null;
    user?: { id: string; email?: string };
  },
  callback: (response: any) => void
) => {
  console.log(message.user);
  chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error sending message:", chrome.runtime.lastError.message);
      callback({ success: false, error: chrome.runtime.lastError.message });
    } else {
      callback(response);
    }
  });
};

const sendTokenToExtensionCallback = (response: { success: any }) => {
  if (chrome.runtime.lastError) {
    console.error("Error sending message:", chrome.runtime.lastError.message);
  } else if (response?.success) {
    console.log("Token successfully sent to the extension.");
  } else {
    console.error("The extension rejected the token.");
  }
};

export const sendTokenToExtension = async (
  session: SignedInSessionResource,
  user: UserResource
) => {
  if (!isChromeApiAvailable()) {
    console.warn(
      "Chrome API is not available. Ensure you are running in a Chrome extension context."
    );
    return;
  }

  try {
    const token = await session.getToken();
    const userPayload = {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
    };

    sendMessageToExtension(
      {
        type: "SET_CLERK_TOKEN",
        token,
        user: userPayload,
      },
      sendTokenToExtensionCallback
    );
  } catch (error) {
    console.error("Error getting Clerk token or sending message:", error);
  }
};

const sendLogoutToExtensionCallback = (response: { success: any }) => {
  if (chrome.runtime.lastError) {
    console.error(
      "Error sending logout message:",
      chrome.runtime.lastError.message
    );
  } else if (response?.success) {
    console.log("Logout message successfully sent to the extension.");
  } else {
    console.error("The extension rejected the logout message.");
  }
};

export const sendLogoutToExtension = () => {
  if (!isChromeApiAvailable()) {
    console.warn(
      "Chrome API is not available. Ensure you are running in a Chrome extension context."
    );
    return;
  }

  sendMessageToExtension(
    { type: "LOGOUT", token: null },
    sendLogoutToExtensionCallback
  );
};

const sendGetAuthToExtensionCallback = (response: { success: any }) => {
  if (chrome.runtime.lastError) {
    console.error(
      "Error sending getAuth message:",
      chrome.runtime.lastError.message
    );
  } else if (response?.success) {
    console.log("GetAuth message successfully sent to the extension.");
  } else {
    console.error("The extension rejected the getAuth message.");
  }
};

export const sendGetAuthToExtension = () => {
  if (!isChromeApiAvailable()) {
    console.warn(
      "Chrome API is not available. Ensure you are running in a Chrome extension context."
    );
    return;
  }

  sendMessageToExtension(
    { type: "GET_AUTH_STATUS" },
    sendGetAuthToExtensionCallback
  );
};
