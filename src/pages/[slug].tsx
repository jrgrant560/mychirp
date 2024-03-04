import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSHelper } from "~/server/helpers/createServerSideHelpers";

const ProfileFeed = (props: {userId: string}) => {

  const {data, isLoading} = api.posts.getPostsByUserId.useQuery({userId: props.userId});

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted.</div>;

  return <div className="flex flex-col">
    {data.map((fullPost) => (
    <PostView {...fullPost} key={fullPost.post.id} />
    ))}
  </div>

};

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
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"

            // style={{ width: "100%", height: "auto", }} this would override the width and height properties of the Image component, allowing for responsive images
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username ?? ""}`}</div>
        <div className="border-b w-full border-slate-400"></div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};


//this pre-hydrates the page with user data, so no loading state is needed when the user visits the Profile page
export const getStaticProps: GetStaticProps = async (context) => {
 const ssHelper = generateSSHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssHelper.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssHelper.dehydrate(),
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
