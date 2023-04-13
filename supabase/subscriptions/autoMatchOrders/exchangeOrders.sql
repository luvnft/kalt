-- subscribe to topic, by simply renaming all instances of <<topic name>__<service name>
-- version 6.4.23
-- service auto_match_orders
-- topic   exchange_orders

--- create the table, with default values
CREATE TABLE auto_match_orders__exchange_orders (
    message_id          uuid        NOT NULL  DEFAULT uuid_generate_v4()         PRIMARY KEY,
    message_entity_id   uuid        NOT NULL  DEFAULT uuid_generate_v4(),
    message_created     timestamptz NOT NULL  DEFAULT (now() at time zone 'utc'),
    message_sender      text        NOT NULL,
    message_read        boolean     NOT NULL  DEFAULT FALSE
);

--- add row level security
ALTER TABLE auto_match_orders__exchange_orders ENABLE ROW LEVEL SECURITY;

--- Standard descriptions
comment on column auto_match_orders__exchange_orders.message_id 
is 'this is the unique id of this message, not the unique id of its contents. (for instance, account_transactions have their own account_transaction_id';

comment on column auto_match_orders__exchange_orders.message_entity_id 
is 'Used to correlate messages that are associated with a single entity, since they will have updates in the same table with different message_ids, usually a 1:1 relation to an order_id or similar';

comment on column auto_match_orders__exchange_orders.message_created 
is 'when the message was generated, usually set in the application. It can be created in javascript by doing ok.timestamptz()';

comment on column auto_match_orders__exchange_orders.message_sender 
is 'where the message originates, usually set in the application.';

comment on column auto_match_orders__exchange_orders.message_read 
is 'the only field that is updated in this table, when the service reads it, it changes the bool to true.';


-- Create the trigger function on the exchange_orders
CREATE OR REPLACE FUNCTION auto_match_orders__exchange_orders()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auto_match_orders__exchange_orders (message_id, message_entity_id, message_sender, message_created)
  VALUES (NEW.message_id, NEW.message_entity_id, NEW.message_sender, NEW.message_created);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the topic table and event
CREATE TRIGGER auto_match_orders__exchange_orders
AFTER INSERT ON exchange_orders
FOR EACH ROW
EXECUTE FUNCTION auto_match_orders__exchange_orders();