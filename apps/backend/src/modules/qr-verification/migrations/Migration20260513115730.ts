import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260513115730 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "verification_code" drop constraint if exists "verification_code_code_unique";`);
    this.addSql(`create table if not exists "counterfeit_report" ("id" text not null, "reporter_id" text not null, "reporter_name" text not null, "reporter_email" text null, "reporter_phone" text null, "order_id" text null, "product_id" text null, "vendor_id" text null, "verification_code_id" text null, "title" text not null, "description" text not null, "purchase_location" text null, "evidence_urls" jsonb null, "severity" text check ("severity" in ('low', 'medium', 'high', 'critical')) not null default 'medium', "status" text check ("status" in ('submitted', 'investigating', 'verified', 'rejected', 'resolved')) not null default 'submitted', "assigned_moderator" text null, "resolution" text null, "resolved_at" timestamptz null, "response_to_reporter" text null, "reward_points" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "counterfeit_report_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_counterfeit_report_deleted_at" ON "counterfeit_report" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_counterfeit_report_status" ON "counterfeit_report" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_counterfeit_report_severity" ON "counterfeit_report" ("severity") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_counterfeit_report_vendor_id" ON "counterfeit_report" ("vendor_id") WHERE vendor_id IS NOT NULL AND deleted_at IS NULL;`);

    this.addSql(`create table if not exists "verification_code" ("id" text not null, "code" text not null, "product_id" text null, "variant_id" text null, "vendor_id" text null, "status" text check ("status" in ('active', 'scanned', 'voided', 'expired')) not null default 'active', "batch_id" text null, "serial_number" text null, "manufactured_at" timestamptz null, "expires_at" timestamptz null, "scan_count" integer not null default 0, "first_scanned_at" timestamptz null, "first_scanner_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "verification_code_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_verification_code_code_unique" ON "verification_code" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verification_code_deleted_at" ON "verification_code" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verification_code_status" ON "verification_code" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verification_code_product_id" ON "verification_code" ("product_id") WHERE product_id IS NOT NULL AND deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_verification_code_vendor_id" ON "verification_code" ("vendor_id") WHERE vendor_id IS NOT NULL AND deleted_at IS NULL;`);

    this.addSql(`create table if not exists "scan_event" ("id" text not null, "scanner_id" text null, "firebase_uid" text null, "ip_hash" text null, "user_agent" text null, "latitude" integer null, "longitude" integer null, "city" text null, "result" text check ("result" in ('genuine', 'suspect_counterfeit', 'expired', 'voided', 'invalid')) not null, "risk_flags" jsonb null, "verification_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "scan_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scan_event_verification_id" ON "scan_event" ("verification_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scan_event_deleted_at" ON "scan_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scan_event_result" ON "scan_event" ("result") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scan_event_scanner_id" ON "scan_event" ("scanner_id") WHERE scanner_id IS NOT NULL AND deleted_at IS NULL;`);

    this.addSql(`alter table if exists "scan_event" add constraint "scan_event_verification_id_foreign" foreign key ("verification_id") references "verification_code" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "scan_event" drop constraint if exists "scan_event_verification_id_foreign";`);

    this.addSql(`drop table if exists "counterfeit_report" cascade;`);

    this.addSql(`drop table if exists "verification_code" cascade;`);

    this.addSql(`drop table if exists "scan_event" cascade;`);
  }

}
