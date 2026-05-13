import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260513115731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_link" drop constraint if exists "affiliate_link_short_code_unique";`);
    this.addSql(`alter table if exists "affiliate_account" drop constraint if exists "affiliate_account_customer_id_unique";`);
    this.addSql(`create table if not exists "affiliate_account" ("id" text not null, "customer_id" text not null, "firebase_uid" text null, "display_name" text not null, "avatar_url" text null, "bio" text null, "status" text check ("status" in ('pending', 'active', 'suspended')) not null default 'active', "tier" text check ("tier" in ('bronze', 'silver', 'gold', 'platinum', 'diamond')) not null default 'bronze', "default_commission_bps" integer not null default 500, "total_clicks" integer not null default 0, "total_conversions" integer not null default 0, "lifetime_commission" numeric not null default 0, "pending_commission" numeric not null default 0, "paid_commission" numeric not null default 0, "bank_name" text null, "bank_account_number" text null, "bank_account_holder" text null, "metadata" jsonb null, "raw_lifetime_commission" jsonb not null default '{"value":"0","precision":20}', "raw_pending_commission" jsonb not null default '{"value":"0","precision":20}', "raw_paid_commission" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_account_deleted_at" ON "affiliate_account" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_account_customer_id_unique" ON "affiliate_account" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_account_firebase_uid" ON "affiliate_account" ("firebase_uid") WHERE firebase_uid IS NOT NULL AND deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_link" ("id" text not null, "short_code" text not null, "title" text null, "target_url" text not null, "target_type" text check ("target_type" in ('product', 'shop', 'category', 'campaign', 'home')) not null, "target_id" text null, "commission_bps" integer null, "status" text check ("status" in ('active', 'paused', 'pending', 'expired')) not null default 'active', "expires_at" timestamptz null, "clicks" integer not null default 0, "unique_clicks" integer not null default 0, "conversions" integer not null default 0, "total_commission" numeric not null default 0, "last_click_at" timestamptz null, "account_id" text not null, "raw_total_commission" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_link_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_affiliate_link_short_code_unique" ON "affiliate_link" ("short_code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_link_account_id" ON "affiliate_link" ("account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_link_deleted_at" ON "affiliate_link" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_link_status" ON "affiliate_link" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_link_target_type_target_id" ON "affiliate_link" ("target_type", "target_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_commission" ("id" text not null, "order_id" text not null, "order_total" numeric not null, "commission_amount" numeric not null, "commission_bps" integer not null, "status" text check ("status" in ('pending', 'confirmed', 'cancelled', 'paid')) not null default 'pending', "confirmed_at" timestamptz null, "paid_at" timestamptz null, "payout_id" text null, "account_id" text not null, "link_id" text not null, "raw_order_total" jsonb not null, "raw_commission_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_commission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_commission_account_id" ON "affiliate_commission" ("account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_commission_link_id" ON "affiliate_commission" ("link_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_commission_deleted_at" ON "affiliate_commission" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_commission_status" ON "affiliate_commission" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_commission_order_id" ON "affiliate_commission" ("order_id") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_click" ("id" text not null, "visitor_id" text not null, "ip_hash" text null, "user_agent" text null, "referer" text null, "utm_source" text null, "utm_medium" text null, "utm_campaign" text null, "converted_order_id" text null, "converted_at" timestamptz null, "link_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_click_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_link_id" ON "affiliate_click" ("link_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_deleted_at" ON "affiliate_click" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_visitor_id" ON "affiliate_click" ("visitor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_click_converted_order_id" ON "affiliate_click" ("converted_order_id") WHERE converted_order_id IS NOT NULL AND deleted_at IS NULL;`);

    this.addSql(`create table if not exists "affiliate_payout" ("id" text not null, "amount" numeric not null, "method" text check ("method" in ('bank', 'wallet', 'momo', 'zalopay')) not null, "account_info" text not null, "status" text check ("status" in ('requested', 'processing', 'completed', 'rejected')) not null default 'requested', "requested_at" timestamptz not null default now(), "processed_at" timestamptz null, "rejection_reason" text null, "transaction_ref" text null, "commission_count" integer not null default 0, "account_id" text not null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "affiliate_payout_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_payout_account_id" ON "affiliate_payout" ("account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_payout_deleted_at" ON "affiliate_payout" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_affiliate_payout_status" ON "affiliate_payout" ("status") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "affiliate_link" add constraint "affiliate_link_account_id_foreign" foreign key ("account_id") references "affiliate_account" ("id") on update cascade;`);

    this.addSql(`alter table if exists "affiliate_commission" add constraint "affiliate_commission_account_id_foreign" foreign key ("account_id") references "affiliate_account" ("id") on update cascade;`);
    this.addSql(`alter table if exists "affiliate_commission" add constraint "affiliate_commission_link_id_foreign" foreign key ("link_id") references "affiliate_link" ("id") on update cascade;`);

    this.addSql(`alter table if exists "affiliate_click" add constraint "affiliate_click_link_id_foreign" foreign key ("link_id") references "affiliate_link" ("id") on update cascade;`);

    this.addSql(`alter table if exists "affiliate_payout" add constraint "affiliate_payout_account_id_foreign" foreign key ("account_id") references "affiliate_account" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "affiliate_link" drop constraint if exists "affiliate_link_account_id_foreign";`);

    this.addSql(`alter table if exists "affiliate_commission" drop constraint if exists "affiliate_commission_account_id_foreign";`);

    this.addSql(`alter table if exists "affiliate_payout" drop constraint if exists "affiliate_payout_account_id_foreign";`);

    this.addSql(`alter table if exists "affiliate_commission" drop constraint if exists "affiliate_commission_link_id_foreign";`);

    this.addSql(`alter table if exists "affiliate_click" drop constraint if exists "affiliate_click_link_id_foreign";`);

    this.addSql(`drop table if exists "affiliate_account" cascade;`);

    this.addSql(`drop table if exists "affiliate_link" cascade;`);

    this.addSql(`drop table if exists "affiliate_commission" cascade;`);

    this.addSql(`drop table if exists "affiliate_click" cascade;`);

    this.addSql(`drop table if exists "affiliate_payout" cascade;`);
  }

}
