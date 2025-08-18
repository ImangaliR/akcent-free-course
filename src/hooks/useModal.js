import { useState } from "react";

export const useInfoCardModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentInfoCard, setCurrentInfoCard] = useState(null);

  const showInfoCard = (infoCardData, delay = 0) => {
    setCurrentInfoCard(infoCardData);
    setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const hideInfoCard = () => {
    setIsOpen(false);
    // Clear data after animation
    setTimeout(() => {
      setCurrentInfoCard(null);
    }, 300);
  };

  return {
    isOpen,
    currentInfoCard,
    showInfoCard,
    hideInfoCard,
  };
};
