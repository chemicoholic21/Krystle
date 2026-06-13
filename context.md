I'd build a "AI Job Copilot" that solves the exact problem you identified:

Existing job agents spam irrelevant senior roles. I want an AI recruiter assistant that continuously discovers jobs, scores them against my profile, learns from my feedback, and never applies without approval.

You can paste the following prompt directly into Backgrounder.dev.

Product Prompt for Backgrounder.dev

Build a production-ready Next.js 15 web application called ScoutAI.

Overview

ScoutAI is an AI-powered job discovery and application copilot.

The platform continuously finds jobs from public sources, analyzes them against a user's GitHub profile, resume, and preferences, ranks them using AI, and presents only relevant opportunities.

The system must be human-in-the-loop.

The AI must NEVER auto-apply to jobs.

Every application requires explicit user approval.

Target Users
Students
Recent graduates
Software Engineers
AI Engineers
Developer Relations Engineers
Solutions Engineers
Startup job seekers
Core Problem

Most job search platforms:

Recommend irrelevant jobs
Recommend senior roles to junior candidates
Do not learn from user feedback
Force users to manually search multiple job boards

ScoutAI solves this by:

Aggregating jobs
Understanding candidate skills
Learning preferences
Requiring approval before applying
Tech Stack

Frontend:

Next.js 15 App Router
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion

Backend:

Next.js Route Handlers
Server Actions
Prisma ORM

Database:

PostgreSQL (Neon)

Authentication:

NextAuth/Auth.js
GitHub OAuth
Google OAuth

Hosting:

Vercel

AI Layer:

OpenRouter API

Default Models:

Gemini 2.5 Pro
DeepSeek R1
Claude Sonnet
User Onboarding

When a user signs up:

Collect:

Name
Email
GitHub URL
LinkedIn URL (optional)
Resume PDF upload
Preferred locations
Remote preference
Desired roles
Experience level

Experience level:

Student
Intern
New Grad
Junior
Mid-Level
Senior

Store in database.

GitHub Profile Intelligence

User enters GitHub URL.

System must:

Analyze:

Repositories
Languages
Commit activity
README files
Technologies
Stars
Topics

Infer:

Technical skills
Seniority level
Strongest domains
Framework expertise

Example:

Python
FastAPI
React
AWS
Docker
LLMs
PostgreSQL

Generate a skills profile.

Resume Intelligence

User uploads PDF.

AI extracts:

Skills
Experience
Education
Projects
Achievements

Creates structured candidate profile.

Job Sources

Create modular job connectors.

Initial connectors:

Greenhouse
Lever
Wellfound
YC Jobs
RemoteOK
Company Career Pages

Future:

LinkedIn
Apify
Indeed

Store all jobs in database.

AI Matching Engine

For every job:

Compute:

Match Score 0–100

Scoring factors:

Positive

+40 skills overlap

+20 role relevance

+15 location match

+15 remote match

+10 startup preference

Negative

-50 senior role

-50 manager role

-30 missing required skills

-20 experience mismatch

Hard Filtering Rules

If user level is:

Student

Reject:

Senior
Lead
Staff
Principal
Architect
Manager
New Grad

Reject:

More than 3 years required
Human-In-The-Loop Workflow

Jobs are placed into:

Recommended

AI score > 80

Review

AI score 60–80

Ignore

Below 60

User actions:

Apply
Watchlist
Ignore

AI learns from actions.

Feedback Learning

Every user action updates preferences.

Example:

If user repeatedly ignores:

Java
Enterprise
SAP

Decrease future rankings.

If user repeatedly applies:

AI
Developer Tools
Startups

Increase future rankings.

Telegram Integration

Allow user to connect Telegram.

Daily digest:

Send:

Top 10 jobs

Format:

Company
Role
Location
Score
Why it matches

Buttons:

Apply
Watchlist
Ignore

Dashboard

Create modern SaaS dashboard.

Sections:

Overview
Total jobs found
Applications sent
Watchlisted jobs
Match accuracy
Job Feed

Infinite scroll.

Filters:

Remote
Hybrid
Location
Salary
Role
AI Insights

Show:

Missing skills
Trending technologies
Career recommendations
Profile

Edit preferences.

AI Career Coach

Add assistant panel.

Questions:

What skills should I learn?
Why was this job recommended?
How do I improve my profile?

Uses candidate profile + job market data.

Resume Tailoring

Generate custom resume versions per job.

Features:

Keyword optimization
ATS optimization
Skill highlighting
Application Tracking

Statuses:

Applied
Interview
Assessment
Rejected
Offer

Kanban board UI.

Cron Jobs

Daily:

Scrape jobs
Refresh rankings
Send Telegram digest

Weekly:

Generate career insights
Vercel Requirements

Must deploy cleanly on Vercel.

Use:

Server Actions
Edge-compatible APIs where possible
Background jobs via Vercel Cron

No hardcoded secrets.

Use environment variables.

UI Design

Modern AI SaaS style.

Inspired by:

Linear
Vercel
Notion
Cursor

Dark mode first.

Responsive.

Premium animations.

Deliverables

Generate:

Complete Next.js project
Prisma schema
Database models
API routes
Dashboard pages
Authentication
AI services
Telegram integration
Job matching engine
Vercel deployment configuration
README

Focus on clean architecture, scalability, and production readiness.
