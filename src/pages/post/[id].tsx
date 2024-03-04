import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import { generateSSHelper } from "~/server/helpers/createServerSideHelpers";
import { PostView } from "~/components/postview";


//this page catches on every route that is not defined in the pages folder??
const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({
    id,
  });

  // if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data. Something went wrong!</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};


//this pre-hydrates the page with user data, so no loading state is needed when the user visits the Profile page
export const getStaticProps: GetStaticProps = async (context) => {
 const ssHelper = generateSSHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await ssHelper.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssHelper.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default SinglePostPage;
