import {type NextPage} from "next";
import Head from "next/head";


//this page displays a single post
export default function SinglePostPage() {
  return (
    <>
      <main className="flex justify-center h-screen">
        
        <div>Single Post View</div>

      </main>

      <div style={{ backgroundColor: "red", marginTop: "300px" }}>ISSUE: Sans font not being applied! Tailwind --font-sans not defined?</div>
    </>
  );
}
