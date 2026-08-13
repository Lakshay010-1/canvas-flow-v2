import pgFormat from "pg-format";

const user_table_name = "users";
const Users = async (db) => {
    try {
        const response = await db.query(pgFormat(`
                                            CREATE TABLE IF NOT EXISTS %I (
                                            id SERIAL PRIMARY KEY,
                                            google_id VARCHAR(100) UNIQUE,
                                            username TEXT UNIQUE,
                                            email TEXT UNIQUE NOT NULL,
                                            password TEXT,
                                            profileImage TEXT,
                                            profileImageId TEXT,
                                            createdAt DATE NOT NUll,
                                            updatedAt DATE
                                            )
        `, user_table_name));
    } catch (error) {
        console.error(`${user_table_name} Table creation failed!, `, error);
    }
}

export { Users, user_table_name };