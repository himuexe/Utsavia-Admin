import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button'; 
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'; 
import { X } from 'lucide-react'; 

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { login, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    const success = await login(email, password);
    
    if (success) {
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#F9F9F9] to-[#E0E0E0]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-[#E0E0E0]">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#2D3436]">Admin Login</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <X className="h-4 w-4" onClick={clearError} />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-[#2D3436] text-sm font-bold mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block text-[#2D3436] text-sm font-bold mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;