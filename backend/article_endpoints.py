# Enhanced Articles endpoints
class ArticleCreate(BaseModel):
    title: str
    url: str
    description: Optional[str] = None
    category: str = "technology"
    tags: Optional[str] = None
    readTime: Optional[str] = None
    source: Optional[str] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    readTime: Optional[str] = None
    source: Optional[str] = None

class ArticleResponse(BaseModel):
    id: int
    title: str
    url: str
    description: Optional[str] = None
    category: str
    tags: List[str] = []
    readTime: Optional[str] = None
    source: Optional[str] = None
    dateAdded: str
    isRead: bool = False
    isFavorite: bool = False
    
    class Config:
        from_attributes = True

@app.get("/api/articles", response_model=List[ArticleResponse])
async def get_articles():
    """Get all articles"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded, 0 as isRead, 0 as isFavorite
        FROM articles 
        ORDER BY published_at DESC
    """)
    articles = []
    for row in cursor.fetchall():
        article = dict(row)
        # Parse tags from string to list
        article['tags'] = [tag.strip() for tag in (article['tags'] or '').split(',') if tag.strip()]
        # Convert datetime to string
        article['dateAdded'] = article['dateAdded'].split('T')[0] if article['dateAdded'] else ''
        articles.append(ArticleResponse(**article))
    conn.close()
    return articles

@app.post("/api/articles", response_model=ArticleResponse)
async def create_article(article: ArticleCreate):
    """Create a new article"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get admin user ID
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Insert article
    cursor.execute("""
        INSERT INTO articles (user_id, title, content, type, url, tags)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        user['id'], 
        article.title, 
        article.description, 
        article.category, 
        article.url, 
        article.tags
    ))
    
    article_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Return the created article
    return ArticleResponse(
        id=article_id,
        title=article.title,
        url=article.url,
        description=article.description,
        category=article.category,
        tags=[tag.strip() for tag in (article.tags or '').split(',') if tag.strip()],
        readTime=article.readTime,
        source=article.source,
        dateAdded=datetime.now().strftime('%Y-%m-%d'),
        isRead=False,
        isFavorite=False
    )

@app.put("/api/articles/{article_id}", response_model=ArticleResponse)
async def update_article(article_id: int, article: ArticleUpdate):
    """Update an existing article"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if article exists
    cursor.execute("SELECT * FROM articles WHERE id = ?", (article_id,))
    existing_article = cursor.fetchone()
    if not existing_article:
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if article.title is not None:
        update_fields.append("title = ?")
        update_values.append(article.title)
    
    if article.url is not None:
        update_fields.append("url = ?")
        update_values.append(article.url)
    
    if article.description is not None:
        update_fields.append("content = ?")
        update_values.append(article.description)
    
    if article.category is not None:
        update_fields.append("type = ?")
        update_values.append(article.category)
    
    if article.tags is not None:
        update_fields.append("tags = ?")
        update_values.append(article.tags)
    
    if update_fields:
        update_values.append(article_id)
        cursor.execute(f"""
            UPDATE articles 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, update_values)
        conn.commit()
    
    # Get updated article
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded
        FROM articles 
        WHERE id = ?
    """, (article_id,))
    updated_article = cursor.fetchone()
    conn.close()
    
    return ArticleResponse(
        id=updated_article['id'],
        title=updated_article['title'],
        url=updated_article['url'],
        description=updated_article['description'],
        category=updated_article['category'],
        tags=[tag.strip() for tag in (updated_article['tags'] or '').split(',') if tag.strip()],
        readTime=article.readTime,
        source=article.source,
        dateAdded=updated_article['dateAdded'].split('T')[0] if updated_article['dateAdded'] else '',
        isRead=False,
        isFavorite=False
    )

@app.delete("/api/articles/{article_id}")
async def delete_article(article_id: int):
    """Delete an article"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if article exists
    cursor.execute("SELECT id FROM articles WHERE id = ?", (article_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Delete article
    cursor.execute("DELETE FROM articles WHERE id = ?", (article_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Article deleted successfully"}

@app.get("/api/articles/{article_id}", response_model=ArticleResponse)
async def get_article(article_id: int):
    """Get a specific article"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, url, content as description, type as category, tags, 
               published_at as dateAdded
        FROM articles 
        WHERE id = ?
    """, (article_id,))
    article = cursor.fetchone()
    conn.close()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleResponse(
        id=article['id'],
        title=article['title'],
        url=article['url'],
        description=article['description'],
        category=article['category'],
        tags=[tag.strip() for tag in (article['tags'] or '').split(',') if tag.strip()],
        readTime=None,
        source=None,
        dateAdded=article['dateAdded'].split('T')[0] if article['dateAdded'] else '',
        isRead=False,
        isFavorite=False
    )
