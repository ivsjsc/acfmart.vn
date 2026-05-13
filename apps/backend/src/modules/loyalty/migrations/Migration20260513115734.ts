import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260513115734 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_account" drop constraint if exists "loyalty_account_customer_id_unique";`);
    this.addSql(`create table if not exists "loyalty_account" ("id" text not null, "customer_id" text not null, "firebase_uid" text null, "balance" integer not null default 0, "total_earned" integer not null default 0, "total_redeemed" integer not null default 0, "total_expired" integer not null default 0, "lifetime_spend" numeric not null default 0, "tier" text check ("tier" in ('silver', 'gold', 'platinum', 'diamond')) not null default 'silver', "tier_anniversary" timestamptz null, "metadata" jsonb null, "raw_lifetime_spend" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_loyalty_account_customer_id_unique" ON "loyalty_account" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_account_deleted_at" ON "loyalty_account" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_account_tier" ON "loyalty_account" ("tier") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "loyalty_transaction" ("id" text not null, "type" text check ("type" in ('earn', 'redeem', 'expire', 'adjust')) not null, "points" integer not null, "description" text not null, "reference_type" text null, "reference_id" text null, "expires_at" timestamptz null, "expired_at" timestamptz null, "account_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "loyalty_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_account_id" ON "loyalty_transaction" ("account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_deleted_at" ON "loyalty_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_type" ON "loyalty_transaction" ("type") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_reference_id" ON "loyalty_transaction" ("reference_id") WHERE reference_id IS NOT NULL AND deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_loyalty_transaction_expires_at" ON "loyalty_transaction" ("expires_at") WHERE expires_at IS NOT NULL AND expired_at IS NULL AND deleted_at IS NULL;`);

    this.addSql(`create table if not exists "redemption_option" ("id" text not null, "title" text not null, "description" text null, "points_cost" integer not null, "type" text check ("type" in ('voucher', 'freeship', 'cashback', 'physical_gift')) not null, "reward_amount" numeric null, "voucher_template_id" text null, "metadata" jsonb null, "active" boolean not null default true, "min_tier" text check ("min_tier" in ('silver', 'gold', 'platinum', 'diamond')) not null default 'silver', "stock" integer null, "redeemed_count" integer not null default 0, "expires_at" timestamptz null, "raw_reward_amount" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "redemption_option_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_redemption_option_deleted_at" ON "redemption_option" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_redemption_option_active" ON "redemption_option" ("active") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_redemption_option_min_tier" ON "redemption_option" ("min_tier") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "loyalty_transaction" add constraint "loyalty_transaction_account_id_foreign" foreign key ("account_id") references "loyalty_account" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_transaction" drop constraint if exists "loyalty_transaction_account_id_foreign";`);

    this.addSql(`drop table if exists "loyalty_account" cascade;`);

    this.addSql(`drop table if exists "loyalty_transaction" cascade;`);

    this.addSql(`drop table if exists "redemption_option" cascade;`);
  }

}
