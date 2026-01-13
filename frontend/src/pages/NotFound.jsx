import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/common/Button';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <h1 className="not-found-code">404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/dashboard">
                    <Button icon={Home}>
                        Go to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
