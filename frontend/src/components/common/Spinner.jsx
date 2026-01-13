import './Spinner.css';

const Spinner = ({ size = 'md', className = '' }) => {
    const classes = [
        'spinner',
        size !== 'md' && `spinner-${size}`,
        className
    ].filter(Boolean).join(' ');

    return <div className={classes} />;
};

export default Spinner;
