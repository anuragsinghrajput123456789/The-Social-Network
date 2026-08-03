import React from "react";

const PostSkeleton = () => {
  return (
    <div className="flex flex-col gap-6 w-full pb-20">
      {[1, 2].map((i) => (
        <div key={i} className="bg-ig-surface border border-ig-border rounded-2xl p-4 flex flex-col gap-4 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full skeleton-shimmer"></div>
              <div className="flex flex-col gap-1.5">
                <div className="h-3.5 w-24 rounded bg-ig-border skeleton-shimmer"></div>
                <div className="h-2.5 w-16 rounded bg-ig-border skeleton-shimmer"></div>
              </div>
            </div>
            <div className="w-5 h-5 rounded bg-ig-border skeleton-shimmer"></div>
          </div>
          <div className="w-full aspect-square rounded-xl bg-ig-border skeleton-shimmer"></div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded bg-ig-border skeleton-shimmer"></div>
              <div className="w-6 h-6 rounded bg-ig-border skeleton-shimmer"></div>
              <div className="w-6 h-6 rounded bg-ig-border skeleton-shimmer"></div>
            </div>
            <div className="w-6 h-6 rounded bg-ig-border skeleton-shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton;
