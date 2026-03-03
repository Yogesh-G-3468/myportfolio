import { NextResponse } from "next/server";

interface GitHubRepo {
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    stargazers_count: number;
    fork: boolean;
    updated_at: string;
    topics: string[];
}

export async function GET() {
    try {
        const username = "Yogesh-G-3468";
        const res = await fetch(
            `https://api.github.com/users/${username}/repos?sort=updated&per_page=100&type=owner`,
            {
                headers: {
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "portfolio-site",
                },
                next: { revalidate: 3600 }, // cache for 1 hour
            }
        );

        if (!res.ok) {
            throw new Error(`GitHub API responded with ${res.status}`);
        }

        const repos: GitHubRepo[] = await res.json();

        // Filter out forks, sort by most recently updated
        const filtered = repos
            .filter((repo) => !repo.fork)
            .sort(
                (a, b) =>
                    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
            .map((repo) => ({
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                language: repo.language,
                stars: repo.stargazers_count,
                updatedAt: repo.updated_at,
                topics: repo.topics || [],
            }));

        return NextResponse.json(filtered);
    } catch (error) {
        console.error("GitHub API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch repositories" },
            { status: 500 }
        );
    }
}
