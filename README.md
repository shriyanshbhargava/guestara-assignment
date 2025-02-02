# Assignment: ReactJs Frontend

## Project Overview

This project is a ReactJS application built with Vite that replicates the Mobiscroll monthly calendar timeline. The goal is to implement the calendar from scratch without using Mobiscroll libraries. The application includes event creation, dragging functionality, and state persistence.

## Features

- Exact replica of the Mobiscroll monthly calendar view
- Drag to select a timeline and add an event
- Each event is assigned a different color
- Drag events to move them between dates horizontally
- Add more resources in the Y-axis
- Highlight today's date
- Navigate to previous or next months
- Delete events with an alert popup
- Persistent state even after a hard refresh

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/shriyanshbhargava/guestara-assignment
cd guestara-assignment
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Run the Development Server

```sh
npm run dev
```
 This will start the Vite development server. Open http://localhost:5173 in your browser to view the application.

### 4. Folder Structure

```sh
├── src
│   ├── components    # Reusable UI components
│   ├── pages         # Main pages of the app
│   ├── assets        # Images and styles
│   ├── hooks         # Custom hooks
│   ├── utils         # Utility functions
│   ├── App.jsx       # Root component
│   ├── main.jsx      # Entry point
│   ├── styles.css    # Global styles
├── public            # Static assets
├── package.json      # Project metadata and dependencies
├── vite.config.js    # Vite configuration
└── README.md         # Documentation
```

### 5. 3 things that you learned from this assignment?

- How resizing works: Learned how to resize elements smoothly for better user experience.
-  Drag-and-drop feature: Built a system to move events on the calendar using drag and drop.
- Setting up Vite: Understood how Vite speeds up development and improves performance.

### 6. What was the most difficult part of the assignment?

- Resizing issues: Making sure elements resize smoothly without breaking the layout.

### 7. What you would have done differently given more time?

- Better event handling: Improve how overlapping events are managed.
- Smoother resizing: Make resizing events more user-friendly.

#### GitHub Repo: https://github.com/shriyanshbhargava/guestara-assignment
#### Live Demo: https://guestara-assignment-green.vercel.app/
