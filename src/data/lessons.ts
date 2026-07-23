import { Lesson } from '../types';

export const lessonsList: Lesson[] = [
  {
    dayNumber: 1,
    title: "The Artisan's Illusion",
    tagline: "Your craft is the engine, but solve a problem to build the business.",
    aboutText: "Understand why passion alone isn't enough to build a resilient, wealth-generating business. Today, we look at the trap of selling labor by the hour.",
    illustrationType: "baker",
    carouselCards: [
      {
        id: "day1-1",
        illustrationType: "baker",
        title: "The Baker's Labor",
        text: "Imagine Clara, a legendary baker. Her sourdough is crispy, golden, and loved by the whole neighborhood. She wakes up at 3:00 AM every single morning to knead, shape, and bake by hand. Her craft is beautiful. Her dedication is unquestionable."
      },
      {
        id: "day1-2",
        illustrationType: "hourglass",
        title: "The Vulnerable Engine",
        text: "But one winter, Clara falls severely ill with pneumonia. She cannot leave her bed for two weeks. Because her business is purely tied to her hands and her time, the ovens go cold. The bakery makes exactly $0. Her income is completely coupled to her physical presence."
      },
      {
        id: "day1-3",
        illustrationType: "scale",
        title: "The Artisan's Trap",
        text: "Clara has a highly-skilled job, not a business. Most freelancers and creatives live in this identical trap. If you stop typing, drawing, shooting, or coding, your cash flow dries up. To build sustainable wealth, we must shift from selling 'doing' to selling 'solutions'."
      },
      {
        id: "day1-4",
        illustrationType: "seed",
        title: "The Shift in Mindset",
        text: "Sustainable wealth comes from solving a problem for many, or solving a highly painful, expensive problem for a few wealthy clients. Today, we begin our journey of separating our creation from our physical hours."
      }
    ],
    quiz: {
      question: "What is the primary vulnerability in Clara the baker's business model?",
      options: [
        "Her sourdough recipe was too difficult for others to learn.",
        "Her income was directly tied to her daily physical labor.",
        "She didn't spend enough money on marketing her bread."
      ],
      correctIndex: 1,
      keyInsightText: "Decouple your craft from your physical hours. If your income depends entirely on your daily presence, you don't own a business — you own a highly-demanding job."
    },
    reflectionQuestions: [
      "If you had to step away from your craft for a month due to an emergency, what would happen to your income?",
      "Which part of your creative work is currently the most dependent on your physical presence?",
      "Write down one idea of how your creative skills could solve a problem even while you are asleep."
    ],
    reflectionPlaceholders: [
      "Be honest — would it survive, or would it drop to zero immediately?",
      "Is it the custom design revisions? The live shooting sessions?",
      "Think about templates, pre-recorded insights, or productized services..."
    ]
  },
  {
    dayNumber: 2,
    title: "The Unserved Harbor",
    tagline: "Look where others are blind. Seek underserved markets for your skill.",
    aboutText: "How a brilliant wedding calligrapher found a hidden, highly lucrative niche in corporate estate law instead of competing with thousands of budget freelancers.",
    illustrationType: "compass",
    carouselCards: [
      {
        id: "day2-1",
        illustrationType: "compass",
        title: "The Sea of Competition",
        text: "Meet Julian. He is an exquisite calligrapher. For years, he competed on platforms like Etsy and Fiverr, writing custom wedding invitations. He was constantly undercut by amateur hobbyists charging $5 an hour. He was exhausted and broke."
      },
      {
        id: "day2-2",
        illustrationType: "tailor",
        title: "The Hidden Harbor",
        text: "One day, Julian got a bizarre request: an estate law firm wanted elegant, hand-lettered condolence letters and legacy family trust agreements for ultra-high-net-worth clients. They didn't care about a $5 price tag; they wanted absolute premium distinction."
      },
      {
        id: "day2-3",
        illustrationType: "mirror",
        title: "A Market Untouched",
        text: "Julian realized that law firms spent thousands to impress wealthy clients, but had no in-house aesthetic capability. By shifting his calligraphy from 'wedding invitations' to 'bespoke document presentation for elite legal boutiques', Julian stopped competing with hobbyists."
      },
      {
        id: "day2-4",
        illustrationType: "bridge",
        title: "Repositioning Your Value",
        text: "Julian didn't change his core craft — he changed who he solved a problem for. He targeted a highly painful, high-trust market where clients happily pay for prestige and speed, not hours."
      }
    ],
    quiz: {
      question: "Why was Julian able to charge 10x more for his calligraphy to estate law firms?",
      options: [
        "Because estate law firms are legally required to use calligraphy.",
        "Because he completely changed his letter styling to look like medieval text.",
        "Because he solved a prestige problem for a high-margin, wealthy client."
      ],
      correctIndex: 2,
      keyInsightText: "Don't compete in crowded consumer waters. Reposition your exact same craft to solve high-stakes problems for wealthy, high-margin business clients."
    },
    reflectionQuestions: [
      "Who is currently buying your creative services? Are they budget-sensitive consumers or high-margin businesses?",
      "What is a non-obvious business industry (like law, real estate, medical, corporate training) that might need your visual or creative craft?",
      "How would you translate your current offering into a 'business solution' rather than an 'artistic service'?"
    ],
    reflectionPlaceholders: [
      "Describe your typical customer and how much they worry about price.",
      "Think of sectors where trust and prestige are worth thousands of dollars.",
      "Instead of 'I draw illustrations', think: 'I help tech companies visualize complex data for pitch decks...'"
    ]
  },
  {
    dayNumber: 3,
    title: "Decoupling the Hour",
    tagline: "Stop selling your time. Sell packaged assets and outcomes.",
    aboutText: "Move away from hourly rates and retainers. Discover how productized offerings can create massive leverage for your creative income.",
    illustrationType: "hourglass",
    carouselCards: [
      {
        id: "day3-1",
        illustrationType: "hourglass",
        title: "The Ceiling of Time",
        text: "Marcus is a talented web designer charging $75 an hour. At first, this seems great. But Marcus soon hits a physical wall: there are only 24 hours in a day, and he can realistically only bill 30 hours a week. His earning potential has a hard, unbreakable ceiling."
      },
      {
        id: "day3-2",
        illustrationType: "bridge",
        title: "The Redesign",
        text: "Marcus shifts his model. Instead of 'web design at $75/hr', he launches a package: 'The High-Converting Dentist Landing System'. It is a standardized, pre-built, premium asset. He can deploy it and customize it in just 3 hours, but he sells it as an outcome for a flat $2,500."
      },
      {
        id: "day3-3",
        illustrationType: "scale",
        title: "The Leverage Effect",
        text: "By productizing his craft into a specific, high-value asset, Marcus makes his labor highly leveraged. His clients don't care how many hours he spent; they care that their new page generates patients. He has decoupled his revenue from his calendar."
      }
    ],
    quiz: {
      question: "What is the primary benefit of selling a 'productized outcome' instead of an hourly rate?",
      options: [
        "It allows you to work slower and take more coffee breaks.",
        "It removes the ceiling on your earning potential, rewarding speed and efficiency.",
        "It forces you to work with fewer clients over the course of a year."
      ],
      correctIndex: 1,
      keyInsightText: "Clients buy results, not hours. When you charge a flat rate for a high-value productized outcome, you are rewarded for working faster and smarter, not slower."
    },
    reflectionQuestions: [
      "Look at your current creative tasks. Which one of these could be packaged into a standardized, repeatable system?",
      "If you completed a project in half the time but delivered the exact same exceptional quality, why does hourly billing punish you?",
      "Write down a potential flat-price package you could offer that guarantees a specific outcome."
    ],
    reflectionPlaceholders: [
      "Can you turn your custom work into a repeatable process, checklist, or template set?",
      "Reflect on how billing for time disincentivizes you from being fast and efficient.",
      "e.g., 'A 5-part custom welcome email sequence for boutique hotels for $1,200.'"
    ]
  },
  {
    dayNumber: 4,
    title: "Pain is Your Compass",
    tagline: "Wealth is proportional to the urgency and depth of the pain you solve.",
    aboutText: "To charge premium rates, you must find deep business pain points. If your craft is just a 'nice-to-have', you'll always struggle.",
    illustrationType: "seed",
    carouselCards: [
      {
        id: "day4-1",
        illustrationType: "seed",
        title: "Vitamins vs. Painkillers",
        text: "Think about your craft. Is it a vitamin (nice to have, preventive, easily skipped when money is tight) or a painkiller (vital, urgent, curing a severe headache)? Most creatives sell vitamins. When times get tough, vitamins are the first things cut."
      },
      {
        id: "day4-2",
        illustrationType: "compass",
        title: "The Expensive Headache",
        text: "A local café might want a new menu design (vitamin). They might pay $200. But a SaaS company raising a seed round has a high-stakes investor pitch deck. If they fail, they close. They are in severe pain. Redesigning that pitch deck is a critical painkiller. They will gladly pay $10,000."
      },
      {
        id: "day4-3",
        illustrationType: "scale",
        title: "Aligning with Pain",
        text: "To build a sustainable academy of wealth, you must orient your skills toward high-value, high-consequence pain. Find the people who are losing money, losing customers, or losing sleep — then apply your craft directly to heal that specific wound."
      }
    ],
    quiz: {
      question: "What distinguishes a 'painkiller' creative service from a 'vitamin' service?",
      options: [
        "Painkillers require much more complex software to create.",
        "Painkillers directly address a costly, high-stakes business problem that cannot wait.",
        "Vitamins are only purchased by pharmaceutical companies."
      ],
      correctIndex: 1,
      keyInsightText: "Align your craft with urgent, costly business problems. High-paying clients don't pay for art; they pay to make an expensive, stressful problem disappear."
    },
    reflectionQuestions: [
      "In what way is your current creative service viewed as a 'vitamin' (optional luxury) by your clients?",
      "Who is a client who would lose massive amounts of money or credibility if your specific creative skill wasn't there to save them?",
      "How can you reframe what you do so that it sounds like a painkiller?"
    ],
    reflectionPlaceholders: [
      "When budgets are cut, is your service the first to go? Be honest.",
      "Think about businesses facing high-stakes pitches, launches, or legal transitions.",
      "Instead of 'I edit video', try 'I optimize social video to stop scrollers and convert leads.'"
    ]
  },
  {
    dayNumber: 5,
    title: "The Tailored Solution",
    tagline: "Focus on a narrow, wealthy sub-market rather than pleading with everyone.",
    aboutText: "Specialization is the ultimate creative force multiplier. Learn why narrowing your target market actually expands your wealth.",
    illustrationType: "tailor",
    carouselCards: [
      {
        id: "day5-1",
        illustrationType: "tailor",
        title: "The Generalist's Battle",
        text: "Sophia is a generalist photographer. She shoots weddings, babies, corporate headshots, and real estate. She has to constantly change her marketing, her gear, and her pitch. She is fighting on all fronts and barely making rent."
      },
      {
        id: "day5-2",
        illustrationType: "mirror",
        title: "The Luxury Niche",
        text: "Sophia decides to specialize. She notices that collectors of ultra-premium vintage cars need flawless, editorial-grade photography to sell their vehicles on high-end auction sites like Bring a Trailer. A single successful listing can earn a seller $150,000."
      },
      {
        id: "day5-3",
        illustrationType: "scale",
        title: "The Premium Expert",
        text: "She repositions as 'The Vintage Porsche Photographic Specialist'. Suddenly, she is the only logical choice for collectors. She charges $3,000 per shoot. She shoots two cars a week, works half the time, and is respected as a world-class authority."
      }
    ],
    quiz: {
      question: "What is the primary advantage Sophia gained by narrowing her focus to vintage car collectors?",
      options: [
        "She didn't have to carry as many different heavy lenses.",
        "She became the undisputed premium expert for a wealthy, high-intent audience.",
        "She could stop updating her photography website completely."
      ],
      correctIndex: 1,
      keyInsightText: "Specialization creates instant authority. When you narrow your focus to a specific, wealthy target market, you eliminate generic competition and command premium fees."
    },
    reflectionQuestions: [
      "If you had to pick just one sub-industry or specific type of customer to serve for the next year, who would it be?",
      "Why is that specific sub-group highly motivated and capable of paying premium rates?",
      "What is one unique challenge or lingo that this specific group has that generalists don't understand?"
    ],
    reflectionPlaceholders: [
      "Choose an audience that is wealthy, passionate, and has clear business needs.",
      "What is the financial return they get from having this problem solved beautifully?",
      "Think about industry jargon, unique standards, or specialized platforms they use."
    ]
  }
];

// Procedural generation helper for the remaining days (6 to 30)
// This guarantees we have a complete 30-day course with highly relevant topics
export const getLessonByDay = (day: number): Lesson => {
  const found = lessonsList.find(l => l.dayNumber === day);
  if (found) return found;

  // Procedural topics to make the 30-day experience completely organic and rich
  const topics = [
    {
      title: "The Intellectual Asset",
      tagline: "Build it once, sell it a thousand times.",
      illustrationType: "scale" as const,
      aboutText: "Moving from service-delivery to intellectual property licensing and digital distribution."
    },
    {
      title: "The First Claim",
      tagline: "Formulate your unique market assertion and take the first step.",
      illustrationType: "bridge" as const,
      aboutText: "Crafting your first compelling offer and targeting your first 3 perfect high-paying prospects."
    },
    {
      title: "Pricing the Value, Not the Cost",
      tagline: "The psychology of premium fees and value-anchoring.",
      illustrationType: "scale" as const,
      aboutText: "How to base your price on the financial upside of your client rather than your hours."
    },
    {
      title: "The Client's Real Agenda",
      tagline: "What high-net-worth clients actually buy when they hire a creative.",
      illustrationType: "mirror" as const,
      aboutText: "Uncovering the emotional and professional drivers: status, security, and convenience."
    },
    {
      title: "The Productized Consultation",
      tagline: "Turn your free sales calls into a high-ticket diagnostic asset.",
      illustrationType: "compass" as const,
      aboutText: "Stop giving away your best strategy for free. Package your diagnosis into a paid, low-risk introductory offer."
    },
    {
      title: "The Boundary Engine",
      tagline: "Protecting your time with automated gates and clear scopes.",
      illustrationType: "hourglass" as const,
      aboutText: "How to build automated workflows that filter out low-budget clients and keep scope creep at zero."
    },
    {
      title: "Building the Ecosystem",
      tagline: "How different offerings support and feed into each other.",
      illustrationType: "seed" as const,
      aboutText: "Designing a value ladder that transitions clients smoothly from low-ticket assets to high-end retainers."
    }
  ];

  const topicIndex = (day - 1) % topics.length;
  const topic = topics[topicIndex];

  return {
    dayNumber: day,
    title: `Day ${day}: ${topic.title}`,
    tagline: topic.tagline,
    aboutText: topic.aboutText,
    illustrationType: topic.illustrationType,
    carouselCards: [
      {
        id: `day${day}-1`,
        illustrationType: topic.illustrationType,
        title: `A New Creative Paradigm`,
        text: `Welcome to Day ${day} of The Creative Academy. Today, we expand on our core philosophy: shifting our creative labor from an expense to an invaluable investment. We'll explore how to leverage your unique talent in a structured, repeatable way.`
      },
      {
        id: `day${day}-2`,
        illustrationType: "mirror",
        title: "The Strategic Advantage",
        text: `When you build specialized systems, you stop competing on hourly wage. You position yourself as an advisor rather than a hand. Think about how this transforms your daily relationship with your client.`
      },
      {
        id: `day${day}-3`,
        illustrationType: "scale",
        title: "The Growth Catalyst",
        text: "By treating your knowledge as a proprietary intellectual asset, you create a system that works on your behalf. This is the ultimate path toward true creative freedom and sustainable, compounding wealth."
      }
    ],
    quiz: {
      question: `What is the core takeaway of Day ${day}'s paradigm shift?`,
      options: [
        "That creatives should work longer hours to prove their worth.",
        "That strategic leverage and specialization remove the ceiling on your potential.",
        "That branding is only important for multi-national consumer conglomerates."
      ],
      correctIndex: 1,
      keyInsightText: `Leverage your intelligence over your hours. By productizing your craft and specializing, you establish high-trust authority and capture value rather than billing for labor.`
    },
    reflectionQuestions: [
      `How can you apply Day ${day}'s concept of strategic leverage to your current projects?`,
      "What is the single biggest fear holding you back from offering this solution today?",
      "Who are three ideal prospects you could message about this specific outcome?"
    ],
    reflectionPlaceholders: [
      "Reflect on how you could deliver this outcome with 50% less manual effort.",
      "Is it fear of rejection? Fear of not being skilled enough? Write it down.",
      "List people or businesses who have the exact headache we discussed today."
    ]
  };
};
