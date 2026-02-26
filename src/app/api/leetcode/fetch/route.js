import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { url } = await request.json();

    // Extract slug from URL (e.g., https://leetcode.com/problems/two-sum/)
    const match = url.match(/problems\/([^/]+)/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid LeetCode URL" },
        { status: 400 },
      );
    }
    const titleSlug = match[1];

    // LeetCode GraphQL API
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
          content
          topicTags {
            name
          }
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug },
      }),
    });

    const result = await response.json();

    if (!result.data || !result.data.question) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const question = result.data.question;

    return NextResponse.json({
      success: true,
      data: {
        title: question.title,
        titleSlug: titleSlug,
        difficulty: question.difficulty,
        content: question.content,
        tags: question.topicTags.map((t) => t.name),
        url: url,
      },
    });
  } catch (error) {
    console.error("LeetCode Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
