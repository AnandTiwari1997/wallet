import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import './icon.css';

const IconButton = ({ id, icon, className, style, onClick }: { id?: string; icon: IconDefinition; className?: string; style?: any; onClick: (event: any) => any | void }) => {
    return (
        <button id={id} className={'icon-button'} onClick={onClick}>
            <i aria-hidden="true" className={`icon ${className}`} style={style}>
                <FontAwesomeIcon icon={icon} />
            </i>
        </button>
    );
};

export default IconButton;
