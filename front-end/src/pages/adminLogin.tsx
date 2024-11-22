import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from 'lucide-react';  // Icons for password visibility toggle

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);  // For toggling password visibility
    const [error, setError] = useState<string | null>(null);  // Error message state

    const navigate = useNavigate();

    useEffect(() => {
        // Remove token after 30 minutes
        const removeTokenAfter30Mins = () => {
            setTimeout(() => {
                localStorage.removeItem('access_token');
                console.log('Access token removed after 30 minutes.');
            }, 30 * 60 * 1000); // 30 minutes in milliseconds
        };

        if (localStorage.getItem('access_token')) {
            removeTokenAfter30Mins();
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);  // Clear previous errors
    
        try {
            const endpoint = `http://127.0.0.1:8000/api/v1/login-admin`;
            const form_data = new FormData();
            form_data.append("username", username);
            form_data.append("password", password);
    
            const response = await fetch(endpoint, {
                method: "POST",
                body: form_data,
            });
            
    
            // Handle login failure if credentials are wrong
            if (!response.ok) {
                setError('Incorrect username or password');
                return;
            }
    
            const data = await response.json();
            console.log(data);
    
            // Store the access token in localStorage
            localStorage.setItem('access_token', data.access_token);
    
            // Set token removal timer
            setTimeout(() => {
                localStorage.removeItem('access_token');
                console.log('Access token removed after 30 minutes.');
            }, 15 * 60 * 1000); // 30 minutes in milliseconds
    
            // Navigate to the admin dashboard
            navigate('/admin-dashboard');
        } catch (err) {
            // This handles any network or unexpected errors
            setError('An error occurred during login. Please try again.');
            console.error('An error occurred during login:', err);
        }
    };
    

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        AI Interviewer System
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Admin Dashboard Login
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="text-red-500 text-center p-2 bg-red-100 rounded">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <Label htmlFor="username" className="sr-only">
                                Username
                            </Label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Label htmlFor="password" className="sr-only">
                                Password
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}  // Toggle password visibility
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {/* Show/Hide Password Icon */}
                            <button
                                type="button"
                                onClick={toggleShowPassword}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                        >
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
