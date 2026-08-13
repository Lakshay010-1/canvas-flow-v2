import pgFormat from "pg-format";

const comment_table_name = "comments";
const Comments = async (db) => {
    try {
        const response = await db.query(pgFormat(`
                                            CREATE TABLE IF NOT EXISTS %I (
                                            id SERIAL PRIMARY KEY,
                                            comment TEXT NOT NULL,
                                            commentedby_id INTEGER NOT NULL,
                                            commentedoncanvas_id INTEGER,
                                            commentedoncomment_id INTEGER,
                                            createdAt DATE NOT NUll,
                                            updatedAt DATE,
                                            CONSTRAINT commented_by FOREIGN KEY (commentedby_id) REFERENCES users(id),
                                            CONSTRAINT commented_on_canvas FOREIGN KEY (commentedoncanvas_id) REFERENCES canvases(id),
                                            CONSTRAINT commented_on_comment FOREIGN KEY (commentedoncomment_id) REFERENCES comments(id)
                                            )
        `, comment_table_name));
    } catch (error) {
        console.error(`${comment_table_name} Table creation failed!, `, error);
    }
}

export { Comments, comment_table_name };