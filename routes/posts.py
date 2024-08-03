from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.post import Post
from app import db

bp = Blueprint('posts', __name__, url_prefix='/api/posts')

@bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    new_post = Post(
        title=data['title'],
        content=data['content'],
        author_id=get_jwt_identity(),
        tags=data.get('tags', [])
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({"msg": "Post created successfully", "id": new_post.id}), 201

@bp.route('', methods=['GET'])
def get_posts():
    posts = Post.query.order_by(Post.created_at.desc()).all()
    return jsonify([{
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author.username,
        "created_at": post.created_at,
        "tags": post.tags
    } for post in posts]), 200

@bp.route('/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.get_or_404(post_id)
    return jsonify({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "author": post.author.username,
        "created_at": post.created_at,
        "tags": post.tags
    }), 200

@bp.route('/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != get_jwt_identity():
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    post.title = data['title']
    post.content = data['content']
    post.tags = data.get('tags', post.tags)
    db.session.commit()
    return jsonify({"msg": "Post updated successfully"}), 200

@bp.route('/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    post = Post.query.get_or_404(post_id)
    if post.author_id != get_jwt_identity():
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(post)
    db.session.commit()
    return jsonify({"msg": "Post deleted successfully"}), 200