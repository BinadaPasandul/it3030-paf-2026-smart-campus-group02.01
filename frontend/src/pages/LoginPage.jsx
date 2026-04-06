import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Smart Campus Operations Hub</h1>
            <p>Welcome! Please sign in to continue.</p>
            <button 
                onClick={login}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Sign in with Google
            </button>
        </div>
    );
};

export default LoginPage;
