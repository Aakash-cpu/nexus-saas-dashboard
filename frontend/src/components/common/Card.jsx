import './Card.css';

const Card = ({
    children,
    className = '',
    hover = false,
    padding = true,
    ...props
}) => {
    const classes = [
        'card',
        hover && 'card-hover',
        !padding && 'card-no-padding',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '' }) => (
    <div className={`card-header ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }) => (
    <h3 className={`card-title ${className}`}>
        {children}
    </h3>
);

const CardBody = ({ children, className = '' }) => (
    <div className={`card-body ${className}`}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '' }) => (
    <div className={`card-footer ${className}`}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
