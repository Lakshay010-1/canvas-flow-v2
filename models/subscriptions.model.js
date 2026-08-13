import pgFormat from "pg-format";

const sub_table_name = "subscriptions";
const Subscriptions = async (db) => {
    try {
        const response = await db.query(pgFormat(`
                                            CREATE TABLE IF NOT EXISTS %I (
                                            id SERIAL PRIMARY KEY,
                                            subscribedby_id INTEGER NOT NULL,
                                            subscribedTo_id INTEGER NOT NULL,
                                            CONSTRAINT subsribed_by_id FOREIGN KEY (subscribedby_id) REFERENCES users(id),
                                            CONSTRAINT subsribed_to_id FOREIGN KEY (subscribedTo_id) REFERENCES users(id)
                                            )
        `, sub_table_name));
    } catch (error) {
        console.error(`${sub_table_name} Table creation failed!, `, error);
    }
}

export { Subscriptions, sub_table_name };