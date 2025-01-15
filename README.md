# Background Removal Service

A web application that automatically removes backgrounds from images using the Rem-BG model from Hugging Face.

## Features
- Simple file upload interface
- Background removal using state-of-the-art ML model
- Docker containerized for easy deployment

## Prerequisites
- Docker
- Docker Compose

## Quick Start
1. Clone the repository: 
git clone https://github.com/stocktonspencer/background-removal-app.git

2. Start the application:
docker compose up --build

3. Open your browser and navigate to `http://localhost:5173`

## Usage
1. Click the upload button to select an image
2. Wait for processing
3. Download your background-removed image

## Tech Stack
- Frontend: React
- Backend: FastAPI
- ML Model: Rem-BG (Hugging Face)
- Containerization: Docker

<img width="1248" alt="Screenshot 2025-01-15 at 4 01 11 PM" src="https://github.com/user-attachments/assets/3dd9b97d-9176-43ee-8c3a-720d4ed81570" />


