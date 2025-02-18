import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Styled } from 'boxed-material-ui/styles';
import { keyframes } from '@emotion/react/macro';
import { createRoot } from 'react-dom/client';
import { conditionalStyle } from '../../css-in-jss/Styled/Styled';
import { RippleProps, WaveProps } from './Ripple.types';

const wave = keyframes`
    50% {
        box-shadow: 0 0 0 7px currentColor;
    }
    100% {
        opacity: 0;
        box-shadow: 0 0 0 0 currentColor;
    }
`;

const pulse = keyframes`
    0%, 10% {
        opacity: 0;
        transform: scale(1);
    }
    50% {
        opacity: 0.2;
        transform: scale(1.25, 1.25);
    }
    51%, 100% {
        opacity: 0;
        transform: scale(1);
    }
`;

const KEYFRAME_MAP = {
    wave: wave,
    pulse: pulse
};

const CONTAINER = Styled.div<RippleProps>({
    position: `absolute`,
    left: 0,
    top: 0,
    bottom: 0,
    right: 0
});

const WAVE = Styled.span<WaveProps>(({ duration, type }) => {
    return {
        display: `block`,
        position: `absolute`,
        width: `100%`,
        height: `100%`,
        animation: `${KEYFRAME_MAP[type]} ${duration}ms`,
        conditionals: [
            conditionalStyle('type', 'pulse', {
                opacity: `0`,
                boxSizing: `border-box`,
                border: `1px solid currentColor`
            }),
            conditionalStyle('type', 'wave', {
                opacity: `0.3`,
                boxShadow: `0 0 0 0 currentColor`
            })
        ]
    };
});

export type RippleRef = {
    start: () => void;
};

const Ripple = forwardRef<RippleRef, WaveProps>(function Ripple(props, ref) {
    const { duration = 500, type = 'pulse', ...others } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(
        ref,
        () => {
            return {
                start: startRipple
            };
        },
        []
    );

    const startRipple = () => {
        // Creating a whole new node for animation so that we can remove whole node when animation ends
        const holder = document.createElement('div');
        holder.style.position = 'absolute';
        holder.style.width = '100%';
        holder.style.height = '100%';
        containerRef.current?.insertBefore(holder, containerRef.current?.firstChild);
        const root = createRoot(holder);
        root.render(
            <WAVE
                duration={duration}
                type={type}
                {...others}
                onAnimationEnd={(event) => {
                    // Unmounting the all child nodes in the tree
                    root.unmount();
                    // removing the holder node as it has now become dangling node
                    holder.remove();
                }}
            />
        );
    };

    return <CONTAINER ref={containerRef}></CONTAINER>;
});

export default Ripple;
