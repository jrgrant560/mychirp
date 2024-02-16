import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

// CreatePostWizard component: input field for creating a new post
const CreatePostWizard = () => {
  const { user } = useUser();

  if (!user) return null;

  // console.log(user);

  return (
    <div className="flex gap-3 w-full">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <input placeholder="What's on your mind?" className="bg-transparent grow outline-none" />
    </div>
  )
}

// "don't make new files until you know something is going to be reused somewhwere else; that's how you end up with a bunch of files that are never used" - Theo


type PostWithUser = RouterOutputs["posts"]["getAll"][number];

// PostView component: takes in a post and an author, and renders post content
const PostView = (props: PostWithUser) => {

  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 p-4 border-b border-slate-400" >
      <Image
        src={author.imageUrl}
        alt={`@${author.username}'s Profile Image`}
        className="w-14 h-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-400 gap-1">
          <span>{`@${author.username}`}</span>
          <span className="font-thin">{`${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  )

}

// this file runs on the client end

export default function Home() {

  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>No data. Something went wrong!</div>;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <section className="h-full w-full md:max-w-2xl border-x border-slate-400">
          <div className="border-b border-slate-400 p-4 flex">
            {/* Theo's tutorial methods for signin. It looks like Clerk might have updated Sign-in features since then? */}
            {!user.isSignedIn && <div className="flex justify-center">
              <SignInButton />
            </div>}
            {user.isSignedIn && <CreatePostWizard />}
            {!!user.isSignedIn && <SignOutButton />}
          </div>

          {/* list of all past posts */}
          {/* maps all posts onto a PostView component */}
          <div className="flex flex-col">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />))}
          </div>
        </section>
        {/* <UserButton afterSignOutUrl="/" /> */}

      </main>

      <div style={{ backgroundColor: "red", marginTop: "300px" }}>ISSUE: Sans font not being applied! Tailwind --font-sans not defined?</div>
    </>
  );
}
