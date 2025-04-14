/blog_project/blog_project/celery_start.sh
#!/bin/bash
# Start Redis (if not already running as a service)
redis-server &

# Start Celery worker
celery -A blog_project worker -l info &

# Start Celery beat for scheduled tasks
celery -A blog_project beat -l info &