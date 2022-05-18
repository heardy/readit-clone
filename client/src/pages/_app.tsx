import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import axios from 'axios';
import { SWRConfig } from 'swr';

import { AuthProvider } from '../context/auth';

import '../styles/tailwind.css';
import '../styles/icons.css';

import Navbar from '../components/Navbar';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url);
    return res.data;
  } catch (err) {
    throw err.response.data;
  }
};

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const isAuthRoute = authRoutes.includes(pathname);

  return (
    <SWRConfig
      value={{
        fetcher,
        dedupingInterval: 10000,
      }}
    >
      <AuthProvider>
        {!isAuthRoute && <Navbar />}
        <div className={isAuthRoute ? '' : 'pt-12'}>
          <Component {...pageProps} />
        </div>
      </AuthProvider>
    </SWRConfig>
  );
}

export default App;
