
# Enhanced Race Models
class RaceCreate(BaseModel):
    raceName: str
    date: str
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: str = "5k"
    raceType: str = "running"
    notes: Optional[str] = None

class RaceUpdate(BaseModel):
    raceName: Optional[str] = None
    date: Optional[str] = None
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: Optional[str] = None
    raceType: Optional[str] = None
    notes: Optional[str] = None

class RaceResponse(BaseModel):
    id: int
    raceName: str
    date: str
    location: Optional[str] = None
    time: Optional[str] = None
    placement: Optional[str] = None
    distance: str
    raceType: str
    notes: Optional[str] = None
    year: int
    
    class Config:
        from_attributes = True

# Enhanced Races endpoints
@app.get("/api/races", response_model=List[RaceResponse])
async def get_races():
    """Get all races"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes, created_at
        FROM races 
        ORDER BY date DESC
    """)
    races = []
    for row in cursor.fetchall():
        race = dict(row)
        # Extract year from date
        race['year'] = datetime.strptime(race['date'], '%Y-%m-%d').year
        # Add default values for missing fields
        race['distance'] = '5k'  # Default distance
        race['raceType'] = 'running'  # Default race type
        races.append(RaceResponse(**race))
    conn.close()
    return races

@app.post("/api/races", response_model=RaceResponse)
async def create_race(race: RaceCreate):
    """Create a new race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get admin user ID
    cursor.execute("SELECT id FROM users WHERE username = 'admin'")
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    # Insert race
    cursor.execute("""
        INSERT INTO races (user_id, race_name, date, location, time, placement, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        user['id'], 
        race.raceName, 
        race.date, 
        race.location, 
        race.time, 
        race.placement, 
        race.notes
    ))
    
    race_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    # Return the created race
    return RaceResponse(
        id=race_id,
        raceName=race.raceName,
        date=race.date,
        location=race.location,
        time=race.time,
        placement=race.placement,
        distance=race.distance,
        raceType=race.raceType,
        notes=race.notes,
        year=datetime.strptime(race.date, '%Y-%m-%d').year
    )

@app.put("/api/races/{race_id}", response_model=RaceResponse)
async def update_race(race_id: int, race: RaceUpdate):
    """Update an existing race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if race exists
    cursor.execute("SELECT * FROM races WHERE id = ?", (race_id,))
    existing_race = cursor.fetchone()
    if not existing_race:
        conn.close()
        raise HTTPException(status_code=404, detail="Race not found")
    
    # Build update query dynamically
    update_fields = []
    update_values = []
    
    if race.raceName is not None:
        update_fields.append("race_name = ?")
        update_values.append(race.raceName)
    
    if race.date is not None:
        update_fields.append("date = ?")
        update_values.append(race.date)
    
    if race.location is not None:
        update_fields.append("location = ?")
        update_values.append(race.location)
    
    if race.time is not None:
        update_fields.append("time = ?")
        update_values.append(race.time)
    
    if race.placement is not None:
        update_fields.append("placement = ?")
        update_values.append(race.placement)
    
    if race.notes is not None:
        update_fields.append("notes = ?")
        update_values.append(race.notes)
    
    if update_fields:
        update_values.append(race_id)
        cursor.execute(f"""
            UPDATE races 
            SET {', '.join(update_fields)}
            WHERE id = ?
        """, update_values)
        conn.commit()
    
    # Get updated race
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes
        FROM races 
        WHERE id = ?
    """, (race_id,))
    updated_race = cursor.fetchone()
    conn.close()
    
    return RaceResponse(
        id=updated_race['id'],
        raceName=updated_race['race_name'],
        date=updated_race['date'],
        location=updated_race['location'],
        time=updated_race['time'],
        placement=updated_race['placement'],
        distance=race.distance or '5k',
        raceType=race.raceType or 'running',
        notes=updated_race['notes'],
        year=datetime.strptime(updated_race['date'], '%Y-%m-%d').year
    )

@app.delete("/api/races/{race_id}")
async def delete_race(race_id: int):
    """Delete a race"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if race exists
    cursor.execute("SELECT id FROM races WHERE id = ?", (race_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Race not found")
    
    # Delete race
    cursor.execute("DELETE FROM races WHERE id = ?", (race_id,))
    conn.commit()
    conn.close()
    
    return {"message": "Race deleted successfully"}

@app.get("/api/races/{race_id}", response_model=RaceResponse)
async def get_race(race_id: int):
    """Get a specific race"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, race_name, date, location, time, placement, notes
        FROM races 
        WHERE id = ?
    """, (race_id,))
    race = cursor.fetchone()
    conn.close()
    
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
    
    return RaceResponse(
        id=race['id'],
        raceName=race['race_name'],
        date=race['date'],
        location=race['location'],
        time=race['time'],
        placement=race['placement'],
        distance='5k',  # Default
        raceType='running',  # Default
        notes=race['notes'],
        year=datetime.strptime(race['date'], '%Y-%m-%d').year
    )
