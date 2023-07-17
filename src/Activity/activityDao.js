const activityDao = {
    selectActivityByActivityId: async (connection, activityId) => {
        const sql = `
            SELECT activity_id, created_at, title, info, capacity, headcount, total_rating, review_count, image_url, 
            (SELECT COUNT(*) FROM activity_likes WHERE activities.activity_id = activity_likes.activity_id) AS like_num 
            FROM activities
            WHERE activities.activity_id = ?
            `;
        const [queryActivity] = await connection.query(sql, activityId);
        console.log(queryActivity);

        return queryActivity;
    },
}

export default activityDao;