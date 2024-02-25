import { GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";


//this page catches on every route that is not defined in the pages folder??

const ProfilePage: NextPage = () => {

  const { data, isLoading } = api.profile.getUserByUsername.useQuery({ username: "jrgrant560" });

  if (isLoading) return <div>Loading...</div>

  if (!data) return <div>No data. Something went wrong!</div>

  return (


    <>
      <Head>
        <title>Profile</title>
      </Head>
      <main className="flex justify-center h-screen">

        <div>{data.username}</div>

      </main>

      <div style={{ backgroundColor: "red", marginTop: "300px" }}>ISSUE: Sans font not being applied! Tailwind --font-sans not defined?</div>
    </>
  );
};


import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import { db } from "~/server/db";
import superjson from "superjson";

//this pre-hydrates the page with user data, so no loading state is needed when the user visits the Profile page
export const getStaticProps: GetStaticProps = async (context) => {

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {db, currentUser: null}, 
    transformer: superjson,
  });

  const slug = context.params?.slug;

  console.log(context);

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };

};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
}


export default ProfilePage;