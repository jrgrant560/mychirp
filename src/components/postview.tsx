import type { RouterOutputs } from "~/utils/api";

import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

// PostView component: takes in a post and an author, and renders post content
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      {/* TASK: go to profile page by clicking profile image also; wrap inside the same Link component as username */}
      <Image
        src={author.imageUrl}
        alt={`@${author.username}'s Profile Image`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-slate-400">
          {/* the Link component routes without performing a full browser refresh */}
          <Link href={`/@${author.username}`}> {/* routes to profile page */}
            <span>{`@${author.username}`}</span>
          </Link>
          
          {/* TASK: go to single post page by clicking entire post item */}
          <Link href={`/post/${post.id}`}> {/* routes to single post page */}
            <span className="font-thin">{` · ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>

        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
};
