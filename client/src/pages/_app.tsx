import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import axios from 'axios';

import { AuthProvider } from '../context/auth';

import '../styles/tailwind.css';
import '../styles/icons.css';

import Navbar from '../components/Navbar';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const isAuthRoute = authRoutes.includes(pathname);

  return (
    <AuthProvider>
      {!isAuthRoute && <Navbar />}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default App;
