FROM node:18 AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

COPY app/ ./app
COPY run.py ./
COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["python", "run.py"]