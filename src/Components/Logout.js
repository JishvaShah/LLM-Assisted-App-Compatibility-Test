import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('You have been logged out.');
    navigate('/login');
  }, [navigate]);

  return null; 
}

export default Logout;
