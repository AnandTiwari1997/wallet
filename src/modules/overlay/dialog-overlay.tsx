import ReactDOM from 'react-dom';
import CSS from 'csstype';

const containerStyle: CSS.Properties = {
    outline: '0',
    display: 'flex',
    alignItems: 'center',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    height: '100%',
    opacity: '1',
    transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms'
};

const DialogOverlay = ({ open, children, onBackdrop }: { [key: string]: any }) => {
    return (
        open &&
        ReactDOM.createPortal(
            <div className="dialog-overlay">
                <div className="dialog-overlay-backdrop" onClick={onBackdrop}></div>
                <div style={containerStyle}>{children}</div>
            </div>,
            document.getElementsByTagName('body')[0]
        )
    );
};

export default DialogOverlay;
