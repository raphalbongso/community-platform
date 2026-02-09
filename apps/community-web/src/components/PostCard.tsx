import { Card, Avatar, Badge } from "@community/ui";
import { timeAgo, truncate } from "@/lib/format";

interface PostCardProps {
  post: {
    id: string;
    title: string;
    bodyPreview: string;
    type: string;
    likeCount: number;
    commentCount: number;
    publishedAt: string | null;
    creator: {
      username: string;
      displayName: string;
      avatarUrl: string | null;
    };
  };
}

const typeBadge: Record<string, string> = {
  UPDATE: "default",
  ANNOUNCEMENT: "warning",
  DROP: "success",
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar
          src={post.creator.avatarUrl ?? undefined}
          alt={post.creator.displayName}
          fallback={post.creator.displayName[0]}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={`/creator/${post.creator.username}`}
              className="text-sm font-semibold text-gray-900 hover:underline"
            >
              {post.creator.displayName}
            </a>
            <Badge variant={typeBadge[post.type] as "default" | "warning" | "success" ?? "default"}>
              {post.type}
            </Badge>
            {post.publishedAt && (
              <span className="text-xs text-gray-400">{timeAgo(post.publishedAt)}</span>
            )}
          </div>
          <h3 className="font-medium text-gray-900 mb-1">{post.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">
            {truncate(post.bodyPreview, 200)}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>{post.likeCount} likes</span>
            <span>{post.commentCount} comments</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
