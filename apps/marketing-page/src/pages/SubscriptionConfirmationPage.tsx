import { SuccessView } from "../components/ui/ConfirmationView";
import { DefaultPollingView } from "../components/ui/DefaultPollingView";
import { StatusScreen } from "../components/ui/StatusScreen";
import { sendGetAuthToExtension } from "../lib/chromeMessageSender";
import { pollForActiveSubscription } from "../lib/poll";

export const SubscriptionConfirmationPage = () => (
  <StatusScreen
    task={pollForActiveSubscription}
    PollingView={<DefaultPollingView />}
    SuccessView={
      <SuccessView
        title="Subscription Successful"
        description="Your subscription has been successfully activated. You can now enjoy all the premium features of LinkedIn JobLens AI."
      />
    }
    onSuccess={sendGetAuthToExtension}
  />
);
