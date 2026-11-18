export type SportItem = {
  id: string;
  name: string;
  mark: string;
  image: string;
};

export type SportCategory = {
  id: string;
  title: string;
  blurb: string;
  items: SportItem[];
};

export const sportCategories: SportCategory[] = [
  {
    id: "snowboard",
    title: "Snowboards",
    blurb:
      "Topsheet graphics built around the aspis — Greek-key rim with helmet, lambda, labyrinth, wreath, or pinecone.",
    items: [
      {
        id: "sb-helmet",
        name: "Aspis Helmet",
        mark: "Spartan helmet",
        image: "/images/sports/snowboard-helmet.jpg",
      },
      {
        id: "sb-lambda",
        name: "Bronze Lambda",
        mark: "Lambda arrow",
        image: "/images/sports/snowboard-lambda.jpg",
      },
      {
        id: "sb-prism",
        name: "Prism Labyrinth",
        mark: "Labyrinth on prism",
        image: "/images/sports/snowboard-prism.jpg",
      },
      {
        id: "sb-wreath",
        name: "Agate Wreath",
        mark: "Laurel wreath",
        image: "/images/sports/snowboard-wreath.jpg",
      },
      {
        id: "sb-pine",
        name: "Pinecone Deck",
        mark: "Pinecone",
        image: "/images/sports/snowboard-pinecone.jpg",
      },
    ],
  },
  {
    id: "ski-helmets",
    title: "Ski helmets",
    blurb:
      "Alpine lids with a forehead aspis badge — same Greek-key outline, swapped center marks.",
    items: [
      {
        id: "ski-h-mark",
        name: "Black Crest",
        mark: "Spartan helmet",
        image: "/images/sports/ski-helmet-mark.jpg",
      },
      {
        id: "ski-h-violet",
        name: "Violet Lambda",
        mark: "Lambda on marble",
        image: "/images/sports/ski-helmet-violet.jpg",
      },
      {
        id: "ski-h-lab",
        name: "White Labyrinth",
        mark: "Labyrinth",
        image: "/images/sports/ski-helmet-labyrinth.jpg",
      },
      {
        id: "ski-h-wreath",
        name: "Bronze Wreath",
        mark: "Laurel wreath",
        image: "/images/sports/ski-helmet-wreath.jpg",
      },
    ],
  },
  {
    id: "sb-helmets",
    title: "Snowboard helmets",
    blurb:
      "Rounder freestyle shells — pinecone and labyrinth marks on solid and marble finishes.",
    items: [
      {
        id: "sbh-pine",
        name: "Pinecone Freestyle",
        mark: "Pinecone",
        image: "/images/sports/sb-helmet-pinecone.jpg",
      },
      {
        id: "sbh-lab",
        name: "Electric Labyrinth",
        mark: "Labyrinth",
        image: "/images/sports/sb-helmet-labyrinth.jpg",
      },
    ],
  },
  {
    id: "ski-goggles",
    title: "Ski goggles",
    blurb:
      "Strap badges use the circular Greek-key aspis — helmet or lambda mark beside the lens.",
    items: [
      {
        id: "skig-helmet",
        name: "Crest Blue Mirror",
        mark: "Spartan helmet",
        image: "/images/sports/ski-goggles-helmet.jpg",
      },
      {
        id: "skig-lambda",
        name: "Violet Lambda",
        mark: "Lambda arrow",
        image: "/images/sports/ski-goggles-lambda.jpg",
      },
    ],
  },
  {
    id: "sb-goggles",
    title: "Snowboard goggles",
    blurb:
      "Cylindrical freestyle frames — prism, bronze lambda, and agate wreath strap stories.",
    items: [
      {
        id: "sbg-prism",
        name: "Prism Labyrinth",
        mark: "Labyrinth",
        image: "/images/sports/sb-goggles-prism.jpg",
      },
      {
        id: "sbg-lambda",
        name: "Bronze Lambda",
        mark: "Lambda arrow",
        image: "/images/sports/sb-goggles-lambda.jpg",
      },
      {
        id: "sbg-wreath",
        name: "Agate Wreath",
        mark: "Laurel wreath",
        image: "/images/sports/sb-goggles-wreath.jpg",
      },
    ],
  },
  {
    id: "skate-helmets",
    title: "Skateboard helmets",
    blurb:
      "Hard-shell skate lids with a front aspis — crest, lambda, prism maze, or pinecone.",
    items: [
      {
        id: "skh-mark",
        name: "Black Crest",
        mark: "Spartan helmet",
        image: "/images/sports/skate-helmet-mark.jpg",
      },
      {
        id: "skh-lambda",
        name: "Violet Lambda",
        mark: "Lambda arrow",
        image: "/images/sports/skate-helmet-lambda.jpg",
      },
      {
        id: "skh-prism",
        name: "Prism Labyrinth",
        mark: "Labyrinth",
        image: "/images/sports/skate-helmet-prism.jpg",
      },
      {
        id: "skh-pine",
        name: "Electric Pinecone",
        mark: "Pinecone",
        image: "/images/sports/skate-helmet-pinecone.jpg",
      },
    ],
  },
];

export const sportWorn = [
  {
    src: "/images/sports/worn-ski-kit.jpg",
    label: "Ski helmet + goggles",
  },
  {
    src: "/images/sports/worn-sb-kit.jpg",
    label: "Snowboard helmet + goggles",
  },
  {
    src: "/images/sports/worn-skate-helmet.jpg",
    label: "Skate helmet on head",
  },
];
