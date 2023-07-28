--- create the table, with default values
CREATE TABLE "getLinkedBankAccount" (
  "userId"        uuid      NOT NULL,
  "name"          text,
  "email"         text,
  "iban"          text,
  "bankCode"      text,

  PRIMARY KEY (user_id, iban)
);

--- Add row level security
ALTER TABLE "getLinkedBankAccount" ENABLE ROW LEVEL SECURITY;

--- Create RLS policy
CREATE POLICY "SELF — Select" ON "public"."getLinkedBankAccount"
  AS PERMISSIVE FOR SELECT
  TO authenticated
  USING (auth.uid() = "userId")
