const placesDao = {
  selectPlacesByKeyword: async (keyword, sortBy, coord, connection) => {
    let sql = `
      select p.place_id "placeId", p.name, p.total_rating rating, p.review_count "reviewCount", p.category, a.road, a.jibun
      from places p
      join place_address a on p.place_id = a.place_id
      where name like '%${keyword}%' or a.road like '%${keyword}%' or a.jibun like '%${keyword}%'
      order by 
    `;

    let sortColumn;
    if (sortBy === "rating") {
      sortColumn = "total_rating";
    } else if (sortBy === "review") {
      sortColumn = "review_count";
    } else if (sortBy === "distance") {
      sortColumn = `st_distance_sphere(point(${coord.lon}, ${coord.lat}), point(lon, lat))`;
    }

    const operator = sortBy === "distance" ? ">=" : "<=";
    const order = sortBy === "distance" ? "asc" : "desc";

    if (last) {
      sql += ` and ${sortColumn} ${operator} (select ${sortColumn} from places where category = ${category} and place_id = ${last})`;
    }
    sql += ` order by ${sortColumn} ${order}`;
    sql += " limit 10";

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
  insertReview: async (review, connection) => {
    try {
      const { author, placeId, visitedAt, contents, rating } = review;

      const insertReviewSql = `
      insert into place_reviews(author, visited_at, place_id, contents, rating) 
      values (${author}, "${visitedAt}", ${placeId}, '${contents}', ${rating})
      `;

      await connection.beginTransaction();

      const [queryResult] = await connection.query(insertReviewSql);

      const { insertId: reviewId } = queryResult;

      await connection.commit();

      return reviewId;
    } catch (error) {
      await connection.rollback();
      console.log(error);
    }
  },
  selectPlacesByCategory: async (category, sortBy, coord, last, connection) => {
    let sql = `
      select p.place_id "placeId", p.name, p.total_rating rating, p.review_count "reviewCount", p.category, a.road, a.jibun
      from places p
      join place_address a on p.place_id = a.place_id
      where p.category = ${category}
    `;

    let sortColumn;
    if (sortBy === "rating") {
      sortColumn = "total_rating";
    } else if (sortBy === "review") {
      sortColumn = "review_count";
    } else if (sortBy === "distance") {
      sortColumn = `st_distance_sphere(point(${coord.lon}, ${coord.lat}), point(lon, lat))`;
    }

    const operator = sortBy === "distance" ? ">=" : "<=";
    const order = sortBy === "distance" ? "asc" : "desc";

    if (last) {
      sql += ` and ${sortColumn} ${operator} (select ${sortColumn} from places where category = ${category} and place_id = ${last})`;
    }
    sql += ` order by ${sortColumn} ${order}`;
    sql += " limit 10";

    const [queryResult] = await connection.query(sql);

    return queryResult;
  },
};

export default placesDao;
