const placesDao = {
  selectPlaces: async (keyword, sortBy, coord, connection) => {
    let sql = `
      select p.place_id "placeId", p.name, p.total_rating rating, p.review_count "reviewCount", p.category, a.road, a.jibun
      from places p
      join place_address a on p.place_id = a.place_id
      where name like '%${keyword}%'
      order by 
    `;

    if (sortBy === "rating") {
      sql += `total_rating desc`;
    } else if (sortBy === "review") {
      sql += `review_count desc`;
    } else if (sortBy === "distance") {
      sql += `st_distance_sphere(st_geomfromtext('point(${coord.lat} ${coord.lon})'), st_geomfromtext('point(l.lat l.lon)'))`;
    }

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectPlaceHoursByDay: async (placeId, day, connection) => {
    const sql = `
      select start_time "startTime", end_time "endTime"
      from place_hours
      where place_id = ${placeId} and day = ${day}
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectPlaceImages: async (placeId, connection) => {
    const sql = `
      select image_url
      from place_reviews r
      join place_review_images i on r.review_id = i.review_id
      where r.place_id = ${placeId}
      order by created_at desc
      limit 5
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectPlaceById: async (placeId, connection) => {
    const sql = `
      select place_id, name
      from places
      where place_id = ${placeId}
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectPlaceReviews: async (placeId, last, connection) => {
    let sql = `
      select review_id "reviewId", visited_at "visitedAt", contents, rating, user_id "userId", username, profile_image "profileImage"
      from place_reviews r
      join users u on r.author = u.user_id
      where r.place_id = ${placeId} and r.status = 0  
    `;
    if (last) {
      sql += `and r.created_at < 
        (select created_at
        from place_reviews
        where review_id = ${last})`;
    }
    sql += `
      limit 5
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectReviewImages: async (reviewId, connection) => {
    const sql = `
      select image_url
      from place_review_images
      where review_id = ${reviewId}
    `;

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
  selectActivitiesByPlaceId: async (connection, placeId) => {
    const sql = `
        SELECT * 
        FROM activities
        WHERE place_id = ?;
        `

    const [queryActivities] = await connection.query(sql, placeId);

    return queryActivities;
  }
};

export default placesDao;
