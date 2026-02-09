import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      displayName: "Admin",
      role: "ADMIN",
      emailVerified: true,
    },
  });
  console.log("Created admin:", admin.username);

  // Create demo creator
  const creator = await prisma.user.create({
    data: {
      email: "creator@example.com",
      username: "democreator",
      displayName: "Demo Creator",
      role: "CREATOR",
      emailVerified: true,
      creatorProfile: {
        create: {
          bio: "A demo creator building amazing projects with community support.",
          genreTags: ["music", "electronic", "production"],
          verified: true,
          verifiedAt: new Date(),
          socials: { twitter: "democreator", website: "https://example.com" },
        },
      },
    },
  });
  console.log("Created creator:", creator.username);

  // Create initiative with milestones and tiers
  const initiative = await prisma.initiative.create({
    data: {
      creatorId: creator.id,
      title: "Demo Album Project",
      slug: "demo-album-project",
      intentText: "Creating an amazing new album with your support",
      storyText:
        "This is a full story about the project. We are creating a 12-track electronic album that pushes the boundaries of sound design. Every supporter gets exclusive access to behind-the-scenes content and early releases.",
      status: "ACTIVE",
      publishedAt: new Date(),
      milestones: {
        create: [
          { title: "Writing Complete", position: 0, status: "COMPLETED", completedAt: new Date(Date.now() - 30 * 86400000) },
          { title: "Recording Started", position: 1, status: "IN_PROGRESS" },
          { title: "Mixing & Mastering", position: 2, status: "PENDING" },
          { title: "Release", position: 3, status: "PENDING" },
        ],
      },
      supportTiers: {
        create: [
          {
            name: "Supporter",
            priceCents: 1000,
            perksText: "Digital download of the album\nName in the credits\nAccess to supporter-only updates",
            badgeName: "Supporter",
            position: 0,
          },
          {
            name: "Super Supporter",
            priceCents: 2500,
            perksText: "Everything in Supporter tier\nExclusive behind-the-scenes content\nEarly access to tracks\nAccess to private community",
            badgeName: "Super Supporter",
            position: 1,
          },
          {
            name: "Ultimate Supporter",
            priceCents: 10000,
            perksText: "Everything in Super Supporter tier\nSigned vinyl record\n1-on-1 video call with the creator\nProducer credit on one track",
            badgeName: "Ultimate",
            position: 2,
            maxQuantity: 10,
          },
        ],
      },
    },
  });
  console.log("Created initiative:", initiative.title);

  // Create a second initiative
  const initiative2 = await prisma.initiative.create({
    data: {
      creatorId: creator.id,
      title: "Live Concert Series",
      slug: "live-concert-series",
      intentText: "Bringing live electronic music to intimate venues worldwide",
      storyText: "A series of 5 intimate live concerts in unique venues. Supporters get priority access and exclusive meet-and-greet opportunities.",
      status: "ACTIVE",
      publishedAt: new Date(),
      milestones: {
        create: [
          { title: "Venue Selection", position: 0, status: "COMPLETED", completedAt: new Date() },
          { title: "Rehearsals", position: 1, status: "PENDING" },
          { title: "First Show", position: 2, status: "PENDING" },
        ],
      },
      supportTiers: {
        create: [
          {
            name: "Fan Pass",
            priceCents: 2000,
            perksText: "Priority ticket access\nDigital concert recordings",
            badgeName: "Fan",
            position: 0,
          },
          {
            name: "VIP Pass",
            priceCents: 5000,
            perksText: "Everything in Fan Pass\nMeet-and-greet access\nExclusive merchandise",
            badgeName: "VIP",
            position: 1,
            maxQuantity: 50,
          },
        ],
      },
    },
  });
  console.log("Created initiative:", initiative2.title);

  // Create demo fans
  const fan1 = await prisma.user.create({
    data: {
      email: "fan1@example.com",
      username: "superfan",
      displayName: "Super Fan",
      role: "FAN",
      emailVerified: true,
    },
  });

  const fan2 = await prisma.user.create({
    data: {
      email: "fan2@example.com",
      username: "musiclover",
      displayName: "Music Lover",
      role: "FAN",
      emailVerified: true,
    },
  });
  console.log("Created fans:", fan1.username, fan2.username);

  // Get tiers
  const tiers = await prisma.supportTier.findMany({
    where: { initiativeId: initiative.id },
    orderBy: { position: "asc" },
  });

  // Create purchases and entitlements for fan1
  await prisma.purchase.create({
    data: {
      buyerId: fan1.id,
      initiativeId: initiative.id,
      tierId: tiers[1].id, // Super Supporter
      quantity: 1,
      amountCents: 2500,
      feeCents: 125,
      netCents: 2375,
      provider: "STRIPE",
      providerRef: "pi_demo_001",
    },
  });

  await prisma.entitlement.create({
    data: {
      userId: fan1.id,
      initiativeId: initiative.id,
      tierId: tiers[1].id,
      quantityActive: 1,
    },
  });

  // Create purchase for fan2
  await prisma.purchase.create({
    data: {
      buyerId: fan2.id,
      initiativeId: initiative.id,
      tierId: tiers[0].id, // Supporter
      quantity: 2,
      amountCents: 2000,
      feeCents: 100,
      netCents: 1900,
      provider: "STRIPE",
      providerRef: "pi_demo_002",
    },
  });

  await prisma.entitlement.create({
    data: {
      userId: fan2.id,
      initiativeId: initiative.id,
      tierId: tiers[0].id,
      quantityActive: 2,
    },
  });

  // Update sold counts
  await prisma.supportTier.update({
    where: { id: tiers[0].id },
    data: { soldCount: 2 },
  });
  await prisma.supportTier.update({
    where: { id: tiers[1].id },
    data: { soldCount: 1 },
  });

  console.log("Created purchases and entitlements");

  // Create global forum with thread
  const generalForum = await prisma.forum.create({
    data: {
      scope: "GLOBAL",
      title: "General Discussion",
      slug: "general",
      description: "Talk about anything related to the community",
    },
  });

  const musicForum = await prisma.forum.create({
    data: {
      scope: "GLOBAL",
      title: "Music",
      slug: "music",
      description: "Discuss music, production, and everything audio",
    },
  });

  // Create initiative-specific forum
  await prisma.forum.create({
    data: {
      scope: "INITIATIVE",
      scopeId: initiative.id,
      initiativeId: initiative.id,
      title: "Album Discussion",
      slug: "demo-album-discussion",
      description: "Discuss the Demo Album Project",
      isSupporterOnly: true,
    },
  });

  // Create threads
  const thread1 = await prisma.thread.create({
    data: {
      forumId: generalForum.id,
      authorId: fan1.id,
      title: "Welcome to the community!",
      body: "Hey everyone! Excited to be part of this community. Looking forward to connecting with fellow music lovers and creators.",
    },
  });

  await prisma.thread.create({
    data: {
      forumId: musicForum.id,
      authorId: fan2.id,
      title: "Best DAWs for electronic music in 2024?",
      body: "I'm getting into electronic music production. What DAWs do you all recommend? I've been looking at Ableton and FL Studio.",
    },
  });

  // Create comment on thread
  await prisma.comment.create({
    data: {
      threadId: thread1.id,
      authorId: creator.id,
      body: "Welcome! Great to have you here. Feel free to ask anything about the projects!",
    },
  });

  await prisma.thread.update({
    where: { id: thread1.id },
    data: { replyCount: 1 },
  });

  console.log("Created forums and threads");

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      creatorId: creator.id,
      initiativeId: initiative.id,
      type: "UPDATE",
      title: "Recording has begun!",
      body: "We are in the studio and things are sounding incredible. The first three tracks are taking shape and I can't wait to share them with you all. Stay tuned for some exclusive previews coming soon!",
      visibility: "PUBLIC",
      publishedAt: new Date(Date.now() - 2 * 86400000),
      likeCount: 42,
      commentCount: 8,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: creator.id,
      initiativeId: initiative.id,
      type: "UPDATE",
      title: "Exclusive studio footage",
      body: "Here is some behind-the-scenes content from our recording sessions. Only for our amazing supporters!",
      visibility: "SUPPORTERS",
      publishedAt: new Date(Date.now() - 86400000),
      likeCount: 18,
      commentCount: 3,
    },
  });

  await prisma.post.create({
    data: {
      creatorId: creator.id,
      type: "ANNOUNCEMENT",
      title: "New initiative coming soon!",
      body: "I've been working on something exciting that I'll be announcing next week. Make sure to follow me so you don't miss it!",
      visibility: "PUBLIC",
      publishedAt: new Date(),
      likeCount: 156,
      commentCount: 24,
    },
  });

  // Create comment on post
  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: fan1.id,
      body: "This sounds amazing! Can't wait to hear the final result!",
    },
  });

  console.log("Created posts");

  console.log("\nSeed data created successfully!");
  console.log("\nDemo accounts:");
  console.log("  Admin:   admin@example.com");
  console.log("  Creator: creator@example.com");
  console.log("  Fan 1:   fan1@example.com");
  console.log("  Fan 2:   fan2@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
