import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260513115729 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop constraint if exists "vendor_shop_slug_unique";`);
    this.addSql(`create table if not exists "vendor" ("id" text not null, "shop_name" text not null, "shop_slug" text not null, "shop_logo" text null, "shop_banner" text null, "description" text null, "owner_name" text not null, "owner_email" text not null, "owner_phone" text not null, "firebase_uid" text null, "business_type" text check ("business_type" in ('individual', 'household', 'company')) not null, "tax_code" text null, "id_card_number" text null, "status" text check ("status" in ('pending', 'active', 'suspended', 'rejected')) not null default 'pending', "kyc_level" text check ("kyc_level" in ('none', 'basic', 'verified', 'premium')) not null default 'none', "rejected_reason" text null, "verified_at" timestamptz null, "suspended_at" timestamptz null, "pickup_address" jsonb null, "bank_name" text null, "bank_account_number" text null, "bank_account_holder" text null, "total_orders" integer not null default 0, "total_revenue" numeric not null default 0, "follower_count" integer not null default 0, "avg_rating" integer not null default 0, "on_time_shipping_rate" integer not null default 0, "metadata" jsonb null, "raw_total_revenue" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_shop_slug_unique" ON "vendor" ("shop_slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_deleted_at" ON "vendor" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_status" ON "vendor" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_firebase_uid" ON "vendor" ("firebase_uid") WHERE firebase_uid IS NOT NULL AND deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_owner_email" ON "vendor" ("owner_email") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_document" ("id" text not null, "type" text check ("type" in ('id_card_front', 'id_card_back', 'business_license', 'tax_certificate', 'origin_certificate', 'distribution_contract', 'bank_statement', 'other')) not null, "file_url" text not null, "file_name" text null, "mime_type" text null, "file_size" integer null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "reviewer_note" text null, "reviewed_at" timestamptz null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_document_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_document_vendor_id" ON "vendor_document" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_document_deleted_at" ON "vendor_document" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_document_status" ON "vendor_document" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_document_type" ON "vendor_document" ("type") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_document" add constraint "vendor_document_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_document" drop constraint if exists "vendor_document_vendor_id_foreign";`);

    this.addSql(`drop table if exists "vendor" cascade;`);

    this.addSql(`drop table if exists "vendor_document" cascade;`);
  }

}
