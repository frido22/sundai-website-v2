import { ProjectStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { uploadToGCS } from "@/lib/gcp-storage";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Determine hack_type based on environment
    const isResearchSite = process.env.IS_RESEARCH_SITE === 'true';
    const hack_type = isResearchSite ? 'RESEARCH' : 'REGULAR';

    const projects = await prisma.project.findMany({
      where: {
        AND: [
          status ? { status: status as ProjectStatus } : {},
          { hack_type }
        ]
      },
      include: {
        thumbnail: {
          select: {
            url: true,
            alt: true,
          },
        },
        launchLead: {
          include: {
            avatar: true,
          },
        },
        participants: {
          include: {
            hacker: {
              include: {
                avatar: true,
              },
            },
          },
        },
        techTags: true,
        domainTags: true,
        votes: {
          select: {
            hackerId: true,
            voteType: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        {
          status: status === "PENDING" ? "asc" : "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json(
      projects.map((project) => ({
        ...project,
        votes: project.votes.map((vote) => ({
          hackerId: vote.hackerId,
          voteType: vote.voteType,
          createdAt: vote.createdAt,
        })),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Error fetching projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const preview = formData.get("preview") as string;
    const members = JSON.parse(formData.get("members") as string);

    if (!title) {
      return NextResponse.json({ 
        message: "Title is required" 
      }, { status: 400 });
    }

    if (!preview) {
      return NextResponse.json({ 
        message: "Preview is required" 
      }, { status: 400 });
    }

    if (preview.length > 100) {
      return NextResponse.json({ 
        message: "Preview must be 100 characters or less" 
      }, { status: 400 });
    }

    // Get the hacker using clerkId
    const hacker = await prisma.hacker.findUnique({
      where: { clerkId: userId },
    });

    if (!hacker) {
      return new NextResponse("Builder not found", { status: 404 });
    }

    // Get or create current week
    const now = new Date();
    let currentWeek = await prisma.week.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (!currentWeek) {
      // Create a new week if none exists
      const startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);

      // Get the latest week number
      const latestWeek = await prisma.week.findFirst({
        orderBy: { number: "desc" },
      });
      const weekNumber = (latestWeek?.number || 0) + 1;

      currentWeek = await prisma.week.create({
        data: {
          number: weekNumber,
          startDate,
          endDate,
          theme: `Week ${weekNumber}`,
          description: `Projects for week ${weekNumber}`,
        },
      });
    }

    // Determine hack_type based on environment
    const isResearchSite = process.env.IS_RESEARCH_SITE === 'true';
    const hack_type = isResearchSite ? 'RESEARCH' : 'REGULAR';

    // Create project with participants and thumbnail
    const project = await prisma.project.create({
      data: {
        title,
        preview,
        launchLeadId: hacker.id,
        status: "DRAFT",
        hack_type,
        is_broken: false,
        is_starred: false,
        weeks: {
          connect: {
            id: currentWeek.id,
          },
        },
        participants: {
          create: members.map((member: { id: string; role: string }) => ({
            hackerId: member.id,
            role: member.role,
          })),
        },
      },
      include: {
        participants: {
          include: {
            hacker: true,
          },
        },
        thumbnail: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
