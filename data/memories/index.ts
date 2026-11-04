
export interface MemoryEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  places?: string[];
  highlights: string[];
  photos: string[];
}

export const memories: MemoryEvent[] = [
  {
    id: "international-mother-language-day",
    title: "International Mother Language Day",
    date: "21 FEB 2025",
    location: "Chandigarh University",
    description: "A memory from International Mother Language Day.",
    highlights: ["International Mother Language Day", "21 February 2025"],
    photos: ["21-feb2025/21 feb 1.jpeg", 
      "21-feb2025/21 feb 3.jpeg",
      "21-feb2025/21 feb 5.jpeg",
      "21-feb2025/21 feb 4.jpeg",
      "21-feb2025/21feb 6.jpeg",
      "21-feb2025/21 feb 7.jpeg"],
  },
  {
    id: "college-tour",
    title: "College Tour",
    date: "23 FEB 2025",
    location: "Chandigarh",
    description: "A college tour exploring memorable places around Chandigarh.",
    places: ["Chandigarh Flower Garden", "Rock Garden", "Bird Park", "Sukhna Lake"],
    highlights: ["Flower Garden", "Rock Garden", "Bird Park", "Sukhna Lake"],
    photos: ["College Tour/WhatsApp Image 2.jpeg",
      "College Tour/WhatsApp Image 3.jpeg",
      "College Tour/WhatsApp Image 4.jpeg",
      "College Tour/WhatsApp Image 2026-11-04 at 2.56.04 AM.jpeg",
      "College Tour/WhatsApp Image 2026-11-02 at 6.57.07 PM.jpeg","College Tour/WhatsApp Image 2026-11-02 at 6.57.08 PM.jpeg"

    ],
  },
  {
    id: "holi-2025",
    title: "Holi 2025",
    date: "21 March 2025",
    location: "Chandigarh University",
    description: "Celetrating Holi 2025 with friends at Chandigarh University.",
    highlights: ["CU Holi 2025"],
    photos: ["Holi-2025/WhatsApp Image 2026-11-04 at 3.16.40 AM.jpeg","Holi-2025/WhatsApp Image 2026-11-02 at 7.00.20 PM.jpeg"],
  },
  {
    id: "vaishno-devi",
    title: "Vaishno Devi Temple Visit",
    date: "08 APR 2025",
    location: "Vaishno Devi",
    description: "A visit to Vaishno Devi Temple.",
    highlights: ["Vaishno Devi Temple Visit"],
    photos: ["Vaishno Devi Temple Visit/WhatsApp Image 2026-11-02 at 7.00.26 PM.jpeg","Vaishno Devi Temple Visit/WhatsApp Image 2026-11-04 at 3.09.31 AM.jpeg","Vaishno Devi Temple Visit/WhatsApp Image 2026-11-04 at 3.09.32.jpeg","Vaishno Devi Temple Visit/WhatsApp Image 2026-11-04 at 3.09.32 AM.jpeg","Vaishno Devi Temple Visit/WhatsApp Image 2026-11-04 at 3.12.59 AM.jpeg"],
  },
  {
    id: "bangla-new-year-2025",
    title: "Bangla New Year 2025",
    date: "14 APR 2025",
    location: "Chandigarh University",
    description: "Celebrating Bangla New Year 1432.",
    highlights: ["Bangla New Year 2025"],
    photos: ["bangla-new-year-2025/WhatsApp Image 2026-11-02 at 7.01.08 PM.jpeg","bangla-new-year-2025/WhatsApp Image 2026-11-02 at 7.01.09 PM.jpeg","bangla-new-year-2025/WhatsApp Image 2026-11-02 at 7.01.11 PM.jpeg",
      "bangla-new-year-2025/WhatsApp Image 2026-11-04 at 10.52.23 AM.jpeg"
    ],
  },
  {
    id: "vr-movie-box",
    title: "VR Movie Box",
    date: "13 JUL 2025",
    location: "Location not added",
    description: "A VR Movie Box experience.",
    highlights: ["VR Movie Box"],
    photos: ["VR Movie Box/WhatsApp Image 2026-11-04 at 10.54.16 AM.jpeg","VR Movie Box/WhatsApp Image 2026-11-04 at 10.54.13 AM.jpeg","VR Movie Box/WhatsApp Image 2026-11-04 at 10.54.12 AM.jpeg","VR Movie Box/WhatsApp Image 2026-11-04 at 10.54.11 AM.jpeg","VR Movie Box/WhatsApp Image 2026-11-04 at 10.54.09 AM.jpeg"],
  },
  {
    id: "janmashtami",
    title: "Janmashtami",
    date: "16 AUG 2025",
    location: "Location not added",
    description: "Memories from Janmashtami.",
    highlights: ["Janmashtami"],
    photos: ["Janmashtami/WhatsApp Image 2026-11-04 at 11.03.53 AM.jpeg","Janmashtami/WhatsApp Image 2026-11-02 at 7.01.33 PM.jpeg","Janmashtami/WhatsApp Image 2026-11-02 at 7.01.32 PM.jpeg","Janmashtami/WhatsApp Image 2026-11-04 at 11.03.51 AM.jpeg","Janmashtami/WhatsApp Image 2026-11-04 at 11.04.01 AM.jpeg","Janmashtami/WhatsApp Image 2026-11-04 at 11.03.55 AM.jpeg","Janmashtami/WhatsApp Image 2026-11-04 at 11.04.00 AM.jpeg"],
  },
  {
    id: "kasauli",
    title: "Kasauli",
    date: "06 SEP 2025",
    location: "Kasauli, Himachal Pradesh",
    description: "A memorable visit to Kasauli.",
    highlights: ["Kasauli Trip"],
    photos: [],
  },
  {
    id: "durga-puja-2025",
    title: "Durga Puja 2025",
    date: "23 SEP – 02 OCT 2025",
    location: "Location not added",
    description: "Memories from Durga Puja 2025.",
    highlights: ["Durga Puja 2025"],
    photos: [],
  },
  {
    id: "folk-clock-3",
    title: "Folk Clock 3.0",
    date: "08 OCT 2025",
    location: "Chandigarh University",
    description: "Memories from Folk Clock 3.0 at Chandigarh University.",
    highlights: ["Folk Clock 3.0", "Chandigarh University"],
    photos: [],
  },
  {
    id: "bhai-fhota",
    title: "Bhai Fhota",
    date: "23 OCT 2025",
    location: "Location not added",
    description: "Memories from Bhai Fhota.",
    highlights: ["Bhai Fota"],
    photos: [],
  },
];
