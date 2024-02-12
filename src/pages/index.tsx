import { SignInButton, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

// this file runs on the client end

export default function Home() {

  const user = useUser();

  const {data} = api.posts.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">

        <div className="h-screen">
          <div>
            {/* Theo's tutorial methods for signin. It looks like Clerk might have updated Sign-in features since then? */}
            {!user.isSignedIn && <SignInButton />}
            {!!user.isSignedIn && <SignOutButton />}
          </div>

          <div>
            {data?.map((post) => (
              <div key={post.id}  >{post.content}</div>
            ))}
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>

      </main>

      <div style={{ backgroundColor: "red" }}>ISSUE: Sans font not being applied! Tailwind --font-sans not defined?</div>
    </>
  );
}
