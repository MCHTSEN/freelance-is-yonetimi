# Personal Freelance OS

## Project Overview
**Personal Freelance OS** is a premium, all-in-one dashboard solution designed for freelancers to manage their professional workflow. The application features a dark-themed, "Operating System" inspired aesthetic with a focus on productivity and clean user experience.

## Tech Stack
*   **Framework:** React 19 (TypeScript)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (via CDN)
*   **Icons:** Google Material Symbols
*   **Typography:** Inter (Display), Fira Code (Monospace)

## Current Features
The application is structured as a Single Page Application (SPA) with a sidebar navigation rail managing the following modules:

1.  **Sales Process (Kanban):** A visual pipeline for tracking leads from "Lead" to "Completed".
2.  **Proposals:** A specialized interface for creating and managing project proposals and cost breakdowns.
3.  **Meetings & Notes:** A calendar-integrated view for managing client meetings and taking structured notes.
4.  **Customer Credentials:** A secure-feel interface for managing client login information and project secrets.
5.  **Finance Dashboard:** A comprehensive view of monthly earnings, active projects, and financial metrics.
6.  **Code Snippets (Available in code):** A repository for reusable code blocks and protected environment variables (includes "Tap to reveal" security feature).

## Project Structure
```text
freelance-is-yonetimi/
├── screens/                 # Individual module components
│   ├── SalesKanban.tsx      # Project management board
│   ├── CreateProposal.tsx   # Proposal generation
│   ├── MeetingNotes.tsx     # Calendar and notes
│   ├── CustomerCredentials.tsx # Password/Secret management
│   ├── FinanceDashboard.tsx # Financial tracking
│   └── CodeSnippets.tsx     # Code library (Unlinked)
├── App.tsx                  # Main layout & Navigation logic
├── index.tsx                # React entry point
├── index.html               # Main HTML & Tailwind configuration
├── package.json             # Dependencies & scripts
└── tsconfig.json            # TypeScript configuration
```

## Future Roadmap (Potential)
*   **Code Snippets Integration:** Add the Code Snippets module to the main navigation.
*   **Data Persistence:** Integrate with a backend or local storage to save user data.
*   **Search Functionality:** Implement global search across all modules.
*   **Mobile Responsiveness:** Optimize the desktop-first design for smaller screens.
