import { defineConfig } from "tinacms";
import categoriesData from "../src/content/categories/categories.json";

const categoriesOptions = categoriesData.categories.map((topic: { name: string }) => ({
  value: topic.name,
  label: topic.name,
}));

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "categories",
        label: "Categories",
        path: "src/content/categories",
        format: "json",
        defaultItem: {
          topics: [],
        },
        fields: [
          {
            type: "object",
            name: "categories",
            label: "Categories",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: item.name || "New Category",
              }),
            },
            fields: [
              {
                type: "string",
                name: "name",
                label: "Category Name",
                required: true,
              },
            ],
          },
        ],
      },

      {
        name: "posts",
        label: "Posts",
        path: "src/content/posts",
        ui: {
          filename: {
            // if disabled, the editor can not edit the filename
            readonly: true,
            slugify: (values) => {
              return `${values?.title
                ?.toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/ /g, "-")}`;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "blurb",
            label: "Blurb (optional, shows on All Posts page)",
            required: false,
          },
          {
            type: "datetime",
            name: "pubDate",
            label: "Date Published",
            required: true,
          },
          {
            type: "image",
            name: "imageUrl",
            label: "Image (optional)",
            required: false,
          },
          {
            type: "string",
            name: "imageAltText",
            label: "Image Alt Text",
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
          {
            label: "Categories",
            name: "categories",
            type: "string",
            list: true,
            options: categoriesOptions,
          },
          {
            type: "boolean",
            label: "Published",
            name: "published",
            required: false,
          },
          {
            type: "boolean",
            label: "Featured",
            name: "featured",
            required: false,
          },
        ],
      },
      {
        name: "static",
        label: "Static Content",
        path: "src/content/static",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },

  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN,
      stopwordLanguages: ["eng"],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
});
