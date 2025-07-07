import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import { UnsubscriptionConfirmationPage } from "./pages/UnsubscriptionConfirmationPage";
import { SubscriptionConfirmationPage } from "./pages/SubscriptionConfirmationPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/unsubscription-success"
          element={<UnsubscriptionConfirmationPage />}
        />
        <Route
          path="/subscription-success"
          element={<SubscriptionConfirmationPage />}
        />
        <Route
          path="/unsubscription-error"
          element={<ErrorPage type="unsubscription" />}
        />
        <Route
          path="/subscription-error"
          element={<ErrorPage type="subscription" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
