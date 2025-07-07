import { SuccessView } from "../components/ui/ConfirmationView";
import { DefaultPollingView } from "../components/ui/DefaultPollingView";
import { StatusScreen } from "../components/ui/StatusScreen";
import { sendGetAuthToExtension } from "../lib/chromeMessageSender";
import {
  pollForCancelledSubscription, // Assuming you have this from our previous chat
} from "../lib/poll";

export const UnsubscriptionConfirmationPage = () => (
  <StatusScreen
    task={pollForCancelledSubscription}
    PollingView={<DefaultPollingView />}
    SuccessView={
      <SuccessView
        title="Unsubscription Confirmed"
        description="Your subscription is set to cancel at the end of the billing period. You can still use all premium features until then."
      />
    }
    onSuccess={sendGetAuthToExtension}
  />
);
