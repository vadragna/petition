DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
          id SERIAL PRIMARY KEY,
          age INT,
          city VARCHAR,
          url VARCHAR,
          user_id NOT NULL UNIQUE REFERENCES user(id)
      );
