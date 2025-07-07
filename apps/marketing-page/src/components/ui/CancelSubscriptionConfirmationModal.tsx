import { useRef, useEffect } from "react";

interface CancelSubscriptionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  endDate: string;
}

const CancelSubscriptionConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  endDate,
}: CancelSubscriptionConfirmationModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      if (isOpen) {
        dialogElement.showModal();
      } else {
        const animationDuration = 300;

        setTimeout(() => {
          dialogElement.close();
        }, animationDuration);
      }
    }
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <dialog ref={dialogRef} onCancel={onClose}>
          <div className="bg-gray-800 text-center p-8 rounded-xl shadow-2xl text-white max-w-md w-full mx-4 modal-content transform transition-transform duration-300 ease-out">
            <h2 className="text-2xl mb-6 text-center font-bold">
              Confirm Cancellation
            </h2>

            <p className="mb-6 text-gray-300 leading-relaxed">
              Are you sure you want to cancel your subscription? You will lose
              access to all premium features at the end of your current billing
              period.
            </p>
            <p className="text-sm mb-8 text-gray-400">
              If you proceed, your subscription will not renew. You can
              resubscribe at any time.
            </p>
            <p className="text-sm mb-8 text-red-400">
              {`Your subscription will end on ${endDate}.`}
            </p>

            <div className="flex flex-col sm:flex-row-reverse gap-4">
              <button
                onClick={onConfirm} // Call the onConfirm prop
                className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
              >
                Yes, Cancel Subscription
              </button>
              <button
                onClick={onClose} // Call the onClose prop
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              >
                No, Keep Subscription
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default CancelSubscriptionConfirmationModal;
