# blog/tasks.py
from celery import shared_task # type: ignore
from .models import Notification, Blog, Comment, CustomUser
from django.db.models import Q

@shared_task
def create_blog_notification(blog_id):
    """Create notifications when a new blog is published"""
    try:
        blog = Blog.objects.get(id=blog_id)
        if blog.status == 'post':  # Only notify for published blogs
            # Get all users except the author
            users = CustomUser.objects.exclude(id=blog.author.id)
            
            for user in users:
                Notification.objects.create(
                    user=user,
                    message=f"New blog posted: {blog.title}",
                    blog=blog
                )
            return f"Created notifications for blog: {blog.title}"
    except Blog.DoesNotExist:
        return "Blog not found"

@shared_task
def create_comment_notification(comment_id):
    """Create notification when a comment is added"""
    try:
        comment = Comment.objects.get(id=comment_id)
        blog = comment.blog
        
        # Notify blog author if they're not the commenter
        if blog.author != comment.author and comment.parent_comment is None:
            Notification.objects.create(
                user=blog.author,
                message=f"{comment.author.username} commented on your blog: {blog.title}",
                blog=blog,
                comment=comment
            )
        
        # If this is a reply, notify the parent comment author
        if comment.parent_comment and comment.parent_comment.author != comment.author:
            Notification.objects.create(
                user=comment.parent_comment.author,
                message=f"{comment.author.username} replied to your comment on '{blog.title}'",
                blog=blog,
                comment=comment
            )
            
        return f"Created notification for comment: {comment.id}"
    except Comment.DoesNotExist:
        return "Comment not found"

@shared_task
def clean_old_notifications():
    """Task to remove old notifications (e.g., older than 30 days)"""
    from django.utils import timezone
    import datetime
    
    thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
    deleted_count, _ = Notification.objects.filter(created_at__lt=thirty_days_ago).delete()
    
    return f"Cleaned {deleted_count} old notifications"