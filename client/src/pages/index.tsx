import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
// import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';
import useSWR from 'swr';

import PostCard from '../components/PostCard';

dayjs.extend(relativeTime);

export default function Home() {
  const { data: posts = [] } = useSWR('/posts');

  return (
    <Fragment>
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
    </Fragment>
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
