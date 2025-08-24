import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the current user's clerkId from auth
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { voteType } = body;

    if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
      return new NextResponse("Invalid vote type", { status: 400 });
    }

    // Get the hacker using clerkId
    const hacker = await prisma.hacker.findUnique({
      where: { clerkId },
    });

    if (!hacker) {
      return new NextResponse("Hacker not found", { status: 404 });
    }

    // Use upsert to handle race conditions atomically
    const vote = await prisma.projectVote.upsert({
      where: {
        projectId_hackerId: {
          projectId: params.projectId,
          hackerId: hacker.id,
        },
      },
      update: {
        voteType,
      },
      create: {
        projectId: params.projectId,
        hackerId: hacker.id,
        voteType,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("[PROJECT_VOTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    // Get the current user's clerkId from auth
    const { userId: clerkId } = auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the hacker using clerkId
    const hacker = await prisma.hacker.findUnique({
      where: { clerkId },
    });

    if (!hacker) {
      return new NextResponse("Hacker not found", { status: 404 });
    }

    // Delete vote
    await prisma.projectVote.delete({
      where: {
        projectId_hackerId: {
          projectId: params.projectId,
          hackerId: hacker.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_UNVOTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}