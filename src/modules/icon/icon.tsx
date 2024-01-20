import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import './icon.css';

const Icon = ({ icon, className, style }: { icon: IconDefinition; className?: string; style?: any }) => {
    return (
        <i aria-hidden="true" className={`icon ${className}`} style={style}>
            <FontAwesomeIcon icon={icon} />
        </i>
    );
};

export default Icon;
