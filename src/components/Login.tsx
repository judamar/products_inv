import { useState } from 'react';
import { supabase } from '../database/SupabaseClient';

function Login() {
    const [dni, setDni] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        const { data, error } = await supabase
            .from('users') // 👈 cambia este nombre si tu tabla se llama diferente
            .select('*')
            .eq('dni', dni)
            .eq('password', password)
            .single();

        if (error || !data) {
            setErrorMessage('Cédula o contraseña incorrectas');
        } else {
            // Guarda sesión simple en localStorage
            localStorage.setItem('user', JSON.stringify(data));
            window.location.reload();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-xl mb-4">Iniciar sesión</h1>
            <form onSubmit={handleLogin} className="flex flex-col w-64 gap-3">
                <input
                    type="text"
                    placeholder="Cédula"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-2 border rounded"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Entrar
                </button>
            </form>
            {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
        </div>
    );
}

export default Login;
