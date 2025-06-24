
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = 'Login - The Tomorrows Team';
    navigate('/login', { replace: true });
  }, [navigate]);
  
  return null;
};

export default Login;
