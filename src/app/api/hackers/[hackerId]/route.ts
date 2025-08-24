import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { hackerId: string } }
) {
  try {
    const hacker = await prisma.hacker.findUnique({
      where: { id: params.hackerId },
      include: {
        avatar: true,
        ledProjects: {
          include: {
            thumbnail: true,
            votes: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        projects: {
          include: {
            project: {
              include: {
                thumbnail: true,
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        votes: {
          include: {
            project: {
              include: {
                thumbnail: true,
                launchLead: {
                  include: {
                    avatar: true,
                  },
                },
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!hacker) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    const transformedHacker = {
      ...hacker,
      votedProjects: hacker.votes.map((vote) => ({
        createdAt: vote.createdAt,
        voteType: vote.voteType,
        project: vote.project,
      })),
    };

    if (transformedHacker.votes) {
      delete (transformedHacker as any).votes;
    }

    return NextResponse.json(transformedHacker);
  } catch (error) {
    console.error("Error fetching hacker:", error);
    return NextResponse.json(
      { error: "Error fetching hacker" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { hackerId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the hacker making the request
    const requestingHacker = await prisma.hacker.findUnique({
      where: { clerkId: userId },
    });

    if (!requestingHacker) {
      return new NextResponse("Builder not found", { status: 404 });
    }

    // Check if the hacker is updating their own profile
    if (requestingHacker.id !== params.hackerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const allowedFields = [
      "name",
      "bio",
      "githubUrl",
      "phoneNumber",
      "linkedinUrl",
      "twitterUrl",
      "username",
      "discordName",
      "websiteUrl"
    ];

    // Filter out any fields that aren't allowed to be updated
    const sanitizedData = Object.keys(data).reduce((acc, key) => {
      if (allowedFields.includes(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {} as Record<string, any>);

    const updatedHacker = await prisma.hacker.update({
      where: { id: params.hackerId },
      data: sanitizedData,
      include: {
        avatar: true,
        ledProjects: {
          include: {
            thumbnail: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        projects: {
          include: {
            project: {
              include: {
                thumbnail: true,
                votes: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        votes: {
          include: {
            project: {
              include: {
                thumbnail: true,
                launchLead: {
                  include: {
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(updatedHacker);
  } catch (error) {
    console.error("Error updating builder:", error);
    return NextResponse.json(
      { error: "Error updating builder" },
      { status: 500 }
    );
  }
}
