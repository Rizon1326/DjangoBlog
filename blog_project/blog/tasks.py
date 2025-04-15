# blog/tasks.py
from celery import shared_task
from .models import Notification, Blog, Comment, CustomUser
from django.db.models import Q
from .emails import send_notification_email

@shared_task
def create_blog_notification(blog_id):
    """Create notifications when a new blog is published"""
    try:
        blog = Blog.objects.get(id=blog_id)
        if blog.status == 'post':  # Only notify for published blogs
            # Get all users except the author
            users = CustomUser.objects.exclude(id=blog.author.id)
            
            for user in users:
                # Create notification in database
                Notification.objects.create(
                    user=user,
                    message=f"New blog posted: {blog.title}",
                    blog=blog
                )
                
                # Send email notification
                subject = f"New Blog Post: {blog.title}"
                message = f"Hello {user.username},\n\n{blog.author.username} has posted a new blog titled '{blog.title}'.\n\nCheck it out on our website!"
                send_notification_email(user.email, subject, message)
                
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
            # Create notification in database
            Notification.objects.create(
                user=blog.author,
                message=f"{comment.author.username} commented on your blog: {blog.title}",
                blog=blog,
                comment=comment
            )
            
            # Send email notification
            subject = f"New Comment on Your Blog: {blog.title}"
            message = f"Hello {blog.author.username},\n\n{comment.author.username} commented on your blog '{blog.title}':\n\n'{comment.content[:100]}...'\n\nCheck it out on our website!"
            send_notification_email(blog.author.email, subject, message)
        
        # If this is a reply, notify the parent comment author
        if comment.parent_comment and comment.parent_comment.author != comment.author:
            # Create notification in database
            Notification.objects.create(
                user=comment.parent_comment.author,
                message=f"{comment.author.username} replied to your comment on '{blog.title}'",
                blog=blog,
                comment=comment
            )
            
            # Send email notification
            subject = f"Reply to Your Comment on: {blog.title}"
            message = f"Hello {comment.parent_comment.author.username},\n\n{comment.author.username} replied to your comment on the blog '{blog.title}':\n\n'{comment.content[:100]}...'\n\nCheck it out on our website!"
            send_notification_email(comment.parent_comment.author.email, subject, message)
            
        return f"Created notification for comment: {comment.id}"
    except Comment.DoesNotExist:
        return "Comment not found"