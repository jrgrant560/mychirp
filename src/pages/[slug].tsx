import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { api } from "~/utils/api";

//this page catches on every route that is not defined in the pages folder??

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: "jrgrant560",
  });

  // if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data. Something went wrong!</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="h-48 border-b border-slate-400 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username}'s profile pic`}
            width={64}
            height={64}
            className="-mb-8"
          />
          <div>{data.username}</div>
        </div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";

//this pre-hydrates the page with user data, so no loading state is needed when the user visits the Profile page
export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUser: null }, //currentUser is null because we are not using authentication?
    transformer: superjson,
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
