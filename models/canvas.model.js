import pgFormat from "pg-format";

const canvas_table_name = "canvases";

const Canvases = async (db) => {
    try {
        const response = await db.query(pgFormat(`
                                            CREATE TABLE IF NOT EXISTS %I ( 
                                            id SERIAL PRIMARY KEY,
                                            title TEXT NOT NULL,
                                            canvas BYTEA NOT NULL,
                                            artist_id INTEGER NOT NULL,
                                            views INTEGER NOT NULL,
                                            createdAt DATE NOT NUll,
                                            updatedAt DATE,
                                            CONSTRAINT artist_id FOREIGN KEY (artist_id) REFERENCES users(id)
                                            )
        `, canvas_table_name));
    } catch (error) {
        console.error(`${canvas_table_name} Table creation failed!, `, error);
    }
}


export { Canvases, canvas_table_name };