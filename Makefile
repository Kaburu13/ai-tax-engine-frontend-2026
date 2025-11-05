setup:
cd ai-tax-engine-backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
cd ai-tax-engine-frontend && npm i


run-backend:
cd ai-tax-engine-backend && . .venv/bin/activate && python manage.py runserver 0.0.0.0:8000


run-frontend:
cd ai-tax-engine-backend && npm run dev