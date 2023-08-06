--- create the table, with default values
CREATE TABLE "getPaymentCards" (
  "userId"            uuid        NOT NULL, 
  "cardId"            uuid        NOT NULL  DEFAULT uuid_generate_v4(),
  "lastFourDigits"    numeric,
  "year"              numeric,
  "month"             numeric,
  "status"            text,
  "default"           boolean,
  "number"            numeric,
  "cvc"               numeric,
  PRIMARY KEY ("userId", "cardId")
);


ALTER TABLE "getPaymentCards" ENABLE ROW LEVEL SECURITY;

--- Create RLS policy
CREATE POLICY "SELF — Select" ON "public"."getPaymentCards"
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId");


--- Set default funciton
CREATE OR REPLACE FUNCTION "getPaymentCards_setDefaultCard"()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."default" THEN
        UPDATE "getPaymentCards"
        SET "default" = false
        WHERE "userId" = NEW."userId" AND "cardId" <> NEW."cardId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "getPaymentCards_setDefaultCard"
BEFORE INSERT OR UPDATE OF "default" ON "getPaymentCards"
FOR EACH ROW
EXECUTE FUNCTION "getPaymentCards_setDefaultCard"();