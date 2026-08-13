import pgFormat from "pg-format";

const like_table_name = "likes";
const Likes = async (db) => {
    try {
        const response = await db.query(pgFormat(`
                                            CREATE TABLE IF NOT EXISTS %I (
                                            id SERIAL PRIMARY KEY,
                                            likedby_id INTEGER NOT NULL,
                                            likedToCanvas_id INTEGER ,
                                            likedToComment_id INTEGER ,
                                            CONSTRAINT liked_by_id FOREIGN KEY (likedby_id) REFERENCES users(id),
                                            CONSTRAINT liked_to_canvas_id FOREIGN KEY (likedToCanvas_id) REFERENCES canvases(id),
                                            CONSTRAINT liked_to_comment_id FOREIGN KEY (likedToComment_id) REFERENCES comments(id)
                                            )
        `, like_table_name));
    } catch (error) {
        console.error(`${like_table_name} Table creation failed!, `, error);
    }
}

export { Likes, like_table_name };