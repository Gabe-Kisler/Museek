# Museek - Music Discover Platform

**Live Demo:** https://museek-f10m.onrender.com
**Repo:** https://github.com/Gabe-Kisler/music_recs

## Overview
Museek is a full-stack music discovery platform delivering personalized recommendations. Based on users favorite tracks, museek curates and returns personalized recommendations. 

## Features
- Homepage featuring personalized recommendations using user favorites and general music browsing
- Search tracks, albums, and artists from Spotify's catalog
- User favorites list stores liked tracks, artists, albums, genres, and tags for more personalized recommendations
- Dynamic UI with real time updates
- User auth via Firebase (Email/Password & Google)

## Tech Stack

#### Frontend
React | HTML | CSS
#### Backend
Python | Flask | Docker 
#### Deployment
Render
#### Database
Firebase
#### API Usage
Spotify Web API - Used as main database for music. Retrieves track, album, and artist metadata
LastFM API - Provides related-artist and track information
Apple Music Search API - Supplies additional genre metadata for improved tagging and recommendations

## Screenshots
User login page
<img width="1440" height="784" alt="Screenshot 2025-08-11 at 8 43 18 AM" src="https://github.com/user-attachments/assets/e2a3a3a4-6591-4af8-ab85-9232543b6723" />
Home page upon login, features user recommendtions at the top and general browsing below
<img width="1440" height="790" alt="Screenshot 2025-08-11 at 8 44 18 AM" src="https://github.com/user-attachments/assets/647334f1-f859-46aa-bbe1-86ac933c690d" />
Search results
<img width="1440" height="786" alt="Screenshot 2025-08-11 at 8 44 47 AM" src="https://github.com/user-attachments/assets/d6db8cf9-37a0-46fd-81c2-660f5321fc9d" />
Users favorite list
<img width="1440" height="789" alt="Screenshot 2025-08-11 at 8 45 06 AM" src="https://github.com/user-attachments/assets/d62444be-e1f6-4584-9e7d-0da1f2f54e35" />

## Recommendation Algorithm
The current algorithm generates personalized recommendations by distributing relating tracks around the number of favorite songs a user has favorited. For example, if the user has one song favorited, all recommendations come from that tracks related music. If two songs are favorited, Recommendations are split evenly between them. The algorithm is in early stages of production and currently focuses strictly on user favorite songs. Future updates will expand the algorithm to analyze additional factors allowing stronger recommendations. 

## Status
Museek is currently in production. 
Planned improvements : 
- Enhance recommendation algorithm to incorporate favorite genres, artists, albums, and tags
- Enrich song metadata to offer users deeper insight into thei favorite music 
- Implement mandatory favorite section upon account creation to provide personalized recommendations immediately 
