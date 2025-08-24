"use client";
import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { ChevronUpIcon as ChevronUpSolid, ChevronDownIcon as ChevronDownSolid } from "@heroicons/react/24/solid";

type Vote = {
  hackerId: string;
  voteType: "UPVOTE" | "DOWNVOTE";
  createdAt: string;
};

type VoteButtonsProps = {
  projectId: string;
  votes: Vote[];
  userInfo: { id: string } | null;
  onVote: (projectId: string, voteType: "UPVOTE" | "DOWNVOTE" | null) => Promise<void>;
  className?: string;
};

export default function VoteButtons({ projectId, votes, userInfo, onVote, className = "" }: VoteButtonsProps) {
  const [isVoting, setIsVoting] = useState(false);
  
  const userVote = votes.find(vote => vote.hackerId === userInfo?.id);
  const upvotes = votes.filter(vote => vote.voteType === "UPVOTE").length;
  const downvotes = votes.filter(vote => vote.voteType === "DOWNVOTE").length;
  const netScore = upvotes - downvotes;
  
  const hasUpvoted = userVote?.voteType === "UPVOTE";
  const hasDownvoted = userVote?.voteType === "DOWNVOTE";

  const handleVote = async (e: React.MouseEvent, voteType: "UPVOTE" | "DOWNVOTE") => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isVoting) return; // Prevent multiple clicks
    
    setIsVoting(true);
    try {
      const currentVote = voteType === "UPVOTE" ? hasUpvoted : hasDownvoted;
      await onVote(projectId, currentVote ? null : voteType);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <button
        onClick={(e) => handleVote(e, "UPVOTE")}
        disabled={isVoting}
        className={`p-1 transition-all duration-200 active:scale-95 touch-manipulation ${
          hasUpvoted
            ? "text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300"
            : "text-white hover:text-purple-400 dark:text-white dark:hover:text-purple-400"
        } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Upvote project"
      >
        {hasUpvoted ? (
          <ChevronUpSolid className="h-6 w-6 stroke-[3]" />
        ) : (
          <ChevronUpIcon className="h-6 w-6 stroke-[3]" />
        )}
      </button>
      
      <span className="text-lg font-bold min-w-[2rem] text-center text-purple-400 dark:text-purple-400">
        {netScore}
      </span>
      
      <button
        onClick={(e) => handleVote(e, "DOWNVOTE")}
        disabled={isVoting}
        className={`p-1 transition-all duration-200 active:scale-95 touch-manipulation ${
          hasDownvoted
            ? "text-purple-400 hover:text-purple-300 dark:text-purple-400 dark:hover:text-purple-300"
            : "text-white hover:text-purple-400 dark:text-white dark:hover:text-purple-400"
        } ${isVoting ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-label="Downvote project"
      >
        {hasDownvoted ? (
          <ChevronDownSolid className="h-6 w-6 stroke-[3]" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 stroke-[3]" />
        )}
      </button>
    </div>
  );
}