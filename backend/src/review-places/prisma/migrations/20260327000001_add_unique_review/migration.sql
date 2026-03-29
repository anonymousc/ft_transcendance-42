-- Enforce one review per user per place at the database level
CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_placeName_city_key" ON "Review"("userId", "placeName", "city");
