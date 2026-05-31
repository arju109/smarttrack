# SmartTrack - Technical Writeup

## Project Overview
SmartTrack is an academic credit and course planning system built for IITGN students to track their academic progress, manage courses, and plan future semesters efficiently.

## Technical Decisions

### Frontend
- Chose Next.js with App Router for fast page rendering and easy routing
- Used Tailwind CSS for rapid UI development and responsive design
- Recharts library for interactive data visualizations

### Backend & Database
- Supabase for database and authentication - chosen for its free tier, real-time capabilities, and built-in Row Level Security
- Row Level Security ensures users can only access their own data
- Two main tables: courses and reminders

### Database Schema
- courses table: stores all course records with credits, grades, basket type, and semester
- reminders table: stores academic calendar events and deadlines

## Key Features Implemented
1. Secure authentication with Supabase Auth
2. Complete course management (add, edit, delete)
3. Automatic credit calculation and graduation progress tracking
4. Basket-wise analysis with progress bars
5. Semester planner with credit load warnings
6. Course history with automatic GPA calculation
7. Academic calendar with reminders
8. CSV export of course data
9. Interactive charts (pie chart and bar chart)

## Challenges Faced
- Setting up Supabase Row Level Security policies correctly
- Managing authentication state across pages
- Handling TypeScript types with Supabase data

## What I Would Add With More Time
- Mobile app version using React Native
- Integration with IITGN portal to auto-import courses
- AI-powered course recommendations based on interests
- Timetable conflict detection in semester planner
- Grade prediction based on assignment scores
- Dark mode support
- Push notifications for upcoming deadlines