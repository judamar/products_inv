import { useEffect, useState } from 'react';
import App from './App';
import Login from './components/Login';

export default function ProtectedApp() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    if (!user) return <Login />;

    return <App />;
}
