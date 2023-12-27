-- version 29.7.23
-- service acl_stripe
-- topic   accountTransactions

--- create the table, with default values
CREATE TABLE "sub_accountTransactions_acl_stripe" (
    "event"          uuid          NOT NULL  DEFAULT uuid_generate_v4()         PRIMARY KEY,
    "id"      uuid          NOT NULL  DEFAULT uuid_generate_v4(),
    "timestamp"        timestamptz   NOT NULL  DEFAULT (now() at time zone 'utc'),
    "sender"      text          NOT NULL,
    "message_read"        boolean       NOT NULL  DEFAULT FALSE
);

-- Create the replicate function 
CREATE OR REPLACE FUNCTION "replicate_accountTransactions_acl_stripe"()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "sub_accountTransactions_acl_stripe" (event, id, sender, timestamp)
  VALUES (NEW.event, NEW.id, NEW.sender, NEW.timestamp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create replicate trigger
CREATE TRIGGER "replicate_accountTransactions_acl_stripe"
AFTER INSERT ON "topic_accountTransactions"
FOR EACH ROW
EXECUTE FUNCTION "replicate_accountTransactions_acl_stripe"();

-- Enable RLS
ALTER TABLE "sub_accountTransactions_acl_stripe" ENABLE ROW LEVEL SECURITY;