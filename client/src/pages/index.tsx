import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';

import { Post } from '../types';

import PostCard from '../components/PostCard';

dayjs.extend(relativeTime);

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios
      .get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="pt-12">
      <Head>
        <title>readit: the frontpage of the internet</title>
      </Head>
      <div className="container flex pt-4">
        {/* Posts feed */}
        <div className="w-160">
          {posts.map(post => (
            <PostCard post={post} key={post.identifier} />
          ))}
        </div>

        {/* Sidebar */}
      </div>
    </div>
  );
}

// // This gets called on every request
// export const getServerSideProps: GetServerSideProps = async context => {
//   try {
//     const res = await axios.get('/posts');

//     return { props: { posts: res.data } };
//   } catch (err) {
//     return { props: { error: 'Something went wrong' } };
//   }
// };
