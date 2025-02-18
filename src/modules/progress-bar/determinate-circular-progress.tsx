import './progress-bar.css';
import { ComponentPropsWithoutRef } from 'react';

type DeterminateCircularProgressProp = {
    value: number;
    valueBuffer?: number;
} & ComponentPropsWithoutRef<'div'>;

const DeterminateCircularProgress = ({ value, valueBuffer, ...props }: DeterminateCircularProgressProp) => {
    return (
        <span {...props} className={'circular-progress-bar-container'}>
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative'
                }}
            >
                {valueBuffer && (
                    <span className={'circular-determinate circular-determinate-buffer'}>
                        <svg viewBox="0 0 40 40">
                            <circle
                                style={{
                                    strokeDasharray: Math.ceil(2 * (22 / 7) * 15),
                                    strokeDashoffset: `${
                                        Math.ceil(2 * (22 / 7) * 15) -
                                        (Math.ceil(2 * (22 / 7) * 15) / 100) * valueBuffer
                                    }px`
                                }}
                                className="svg-circle-determinate"
                                cx="20"
                                cy="20"
                                r="15"
                                fill="none"
                                strokeWidth="3"
                            />
                        </svg>
                    </span>
                )}
                <span className={'circular-determinate'}>
                    <svg viewBox="0 0 40 40">
                        <circle
                            style={{
                                strokeDasharray: Math.ceil(2 * (22 / 7) * 15),
                                strokeDashoffset: `${
                                    Math.ceil(2 * (22 / 7) * 15) - (Math.ceil(2 * (22 / 7) * 15) / 100) * value
                                }px`
                            }}
                            className="svg-circle-determinate"
                            cx="20"
                            cy="20"
                            r="15"
                            fill="none"
                            strokeWidth="3"
                        />
                    </svg>
                </span>
            </div>
        </span>
    );
};

export default DeterminateCircularProgress;
