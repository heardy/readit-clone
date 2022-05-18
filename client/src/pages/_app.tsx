import { Fragment } from 'react';
import { AppProps } from 'next/app';
import axios from 'axios';

import '../styles/tailwind.css';
import '../styles/icons.css';

import Navbar from '../components/Navbar';
import Router, { useRouter } from 'next/router';

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  const authRoutes = ['/register', '/login'];
  const isAuthRoute = authRoutes.includes(pathname);

  return (
    <Fragment>
      {!isAuthRoute && <Navbar />}
      <Component {...pageProps} />
    </Fragment>
  );
}

export default App;
