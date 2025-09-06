// components/ui/Portal.tsx
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({
  children,
  containerId = "modal-root",
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get container element
    let modalContainer = document.getElementById(containerId);

    if (!modalContainer) {
      modalContainer = document.createElement("div");
      modalContainer.id = containerId;
      modalContainer.style.position = "fixed";
      modalContainer.style.top = "0";
      modalContainer.style.left = "0";
      modalContainer.style.width = "100%";
      modalContainer.style.height = "100%";
      // modalContainer.style.pointerEvents = "none";
      modalContainer.style.zIndex = "10000";
      document.body.appendChild(modalContainer);
    }

    setContainer(modalContainer);

    // Cleanup function - only remove if empty
    return () => {
      if (
        modalContainer &&
        modalContainer.children.length === 0 &&
        modalContainer.parentNode
      ) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    };
  }, [containerId]);

  if (!container) return null;

  return createPortal(children, container);
};

export default Portal;
