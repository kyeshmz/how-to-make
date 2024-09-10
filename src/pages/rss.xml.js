import rss from "@astrojs/rss";
import { SITE_DESCRIPTION, SITE_TITLE } from "@consts";
import { getCollection } from "astro:content";

export async function GET(context) {
  let posts = await getCollection("posts");

  posts = posts
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate))
    .slice(0, 3);

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: `/posts/${post.slug}`,
      pubDate: post.data.pubDate,
      content: post.body,
      customData: post.data.customData,
    })),
  });
}
