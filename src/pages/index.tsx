import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { api } from "~/utils/api";
import dayjs from "dayjs";

import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postView";

// CreatePostWizard component: input field for creating a new post
const CreatePostWizard = () => {
  const { user } = useUser();

  //TASK: have "React Hook Form" manage input state
  const [input, setInput] = useState(""); //ISSUE: this can cause key appearance in the input field to be delayed, since it is being re-rendered on every key press

  const ctx = api.useUtils();

  // this function posts the content
  // the api is called and all validation & rendering is performed on the server
  // TASK: input validation needs to be performed on the client side instead of the server; Theo recommends "Zod & React hook Form"
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        // <-- causing deploy build to fail
        toast.error(errorMessage[0]);
      } else {
        // ISSUE: User does not know why the post failed, since the error message is not being displayed
        // TASK: Need another else statement to handle the error case where the user is posting too frequently, and send a toast message
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  if (!user) return null;

  // console.log(user);

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile Image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder="What's on your mind?"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          onClick={() => mutate({ content: input })}
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

// Theo tip: "don't make new files until you know something is going to be reused somewhere else; that's how you end up with a bunch of files that are never used"



const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>No data. Something went wrong!</div>;

  return (
    /* list of all past posts */
    /* maps all posts onto a PostView component */
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

// this file runs on the client end
// const Home: NextPage = () => {} this method from the tutorial is not working
export default function Home() {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching posts
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />; //return empty div if user is not loaded

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-slate-400 p-4">
          {/* Theo's tutorial methods for signin. It looks like Clerk might have updated Sign-in features since then? */}
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}

          {isSignedIn && <CreatePostWizard />}

          {!!isSignedIn && (
            <div className="bg-red-800">
              {" "}
              <SignOutButton />{" "}
            </div>
          )}
        </div>
        <Feed />

        {/* <UserButton afterSignOutUrl="/" /> */}
      </PageLayout>
    </>
  );
}
