import { PortalProps } from 'boxed-material-ui/modules';
import { FC, forwardRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const Portal: FC<PortalProps> = forwardRef(function Portal(inProps, ref) {
    const { open, children, container, containerRef } = inProps;
    const [parent, setParent] = useState<HTMLElement | null>(document.body);
    useEffect(() => {
        if (!open) {
            return;
        }
        if (container) {
            setParent(container);
        } else if (containerRef) {
            setParent(containerRef.current);
        } else {
            setParent(document.body);
        }
    }, [container, containerRef]);
    return open && parent ? createPortal(children, parent) : <></>;
});

export default Portal;
