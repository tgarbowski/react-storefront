import { gql } from "@apollo/client";
import { ApolloClient, InMemoryCache } from "@apollo/client";

const API_URI = process.env.NEXT_PUBLIC_API_URI;
const CHANNEL = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL;
const DEFAULT_PRODUCTS_SLUGS = 1000;
const DEFAULT_CATEGORIES_SLUGS = 1000;
const DEFAULT_PAGES_SLUGS = 1000;

const client = new ApolloClient({
  uri: API_URI,
  cache: new InMemoryCache(),
});

function generateSiteMap(data) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>http://localhost:3000/</loc>
    </url>
  ${data.sitemapSlugs.pagesSlugs
    .map((slug) => {
      return `
    <url>
      <loc>${`${process.env.STOREFRONT_URL}/page/${slug}/`}</loc>
    </url>`;
    })
    .join("")}
  ${data.sitemapSlugs.categoriesSlugs
    .map((slug) => {
      return `
    <url>
      <loc>${`${process.env.STOREFRONT_URL}/category/${slug}/`}</loc>
    </url>`;
    })
    .join("")}
  ${data.sitemapSlugs.productSlugs
    .map((slug) => {
      return `
    <url>
      <loc>${`${process.env.STOREFRONT_URL}/product/${slug}/`}</loc>
    </url>`;
    })
    .join("")}
  </urlset>`;
}

function SiteMap() {}

export async function getServerSideProps({ res }) {
  const { data } = await client.query({
    query: gql`
        query {
          sitemapSlugs(
              channel:"${CHANNEL}",
              productsAmount: ${DEFAULT_PRODUCTS_SLUGS},
              categoriesAmount: ${DEFAULT_CATEGORIES_SLUGS},
              pagesAmount: ${DEFAULT_PAGES_SLUGS}
              ){
              productSlugs
              categoriesSlugs
              pagesSlugs
          }}
        `,
  });

  const posts = await data;

  const sitemap = generateSiteMap(posts);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
