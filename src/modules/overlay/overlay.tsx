import "./overlay.css";
import { useEffect } from "react";
import ReactDOM from "react-dom";
import { computePosition } from "@floating-ui/dom";

const Overlay = ({
  open,
  close,
  children,
  onBackdrop,
  triggerBy,
}: {
  [key: string]: any;
}) => {
  useEffect(() => {
    if (!open) return;
    const popover = document.getElementById("overlay-container")!;
    const invoker = document.querySelector("[id=" + triggerBy + "]")!;
    computePosition(invoker, popover, {
      placement: "bottom-start",
      strategy: "absolute",
    }).then(({ x, y }) => {
      Object.assign(popover.style, {
        left: `${x}px`,
        top: `${y}px`,
        position: "absolute",
      });
    });
  }, [open, triggerBy]);

  return (
    open &&
    ReactDOM.createPortal(
      <div className="overlay">
        <div className="overlay-backdrop" onClick={onBackdrop}></div>
        <div id="overlay-container">{children}</div>
      </div>,
      document.getElementById("calender-picker-overlay")!
    )
  );
};

export default Overlay;
