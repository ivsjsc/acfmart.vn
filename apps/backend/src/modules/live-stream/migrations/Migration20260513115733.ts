import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260513115733 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "live_stream" ("id" text not null, "vendor_id" text not null, "host_name" text not null, "host_avatar" text null, "title" text not null, "description" text null, "thumbnail_url" text null, "category" text null, "status" text check ("status" in ('scheduled', 'live', 'ended', 'cancelled')) not null default 'scheduled', "scheduled_start_at" timestamptz not null, "actual_start_at" timestamptz null, "ended_at" timestamptz null, "rtmp_url" text null, "stream_key" text null, "hls_url" text null, "playback_id" text null, "firestore_room_id" text null, "peak_viewers" integer not null default 0, "total_views" integer not null default 0, "total_orders" integer not null default 0, "total_revenue" numeric not null default 0, "duration_seconds" integer not null default 0, "metadata" jsonb null, "raw_total_revenue" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "live_stream_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_live_stream_deleted_at" ON "live_stream" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_live_stream_status" ON "live_stream" ("status") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_live_stream_vendor_id" ON "live_stream" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_live_stream_scheduled_start_at" ON "live_stream" ("scheduled_start_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "stream_featured_product" ("id" text not null, "product_id" text not null, "variant_id" text null, "flash_price" numeric null, "flash_stock" integer null, "display_order" integer not null default 0, "pinned_at" timestamptz null, "unpinned_at" timestamptz null, "clicks" integer not null default 0, "orders" integer not null default 0, "stream_id" text not null, "raw_flash_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "stream_featured_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stream_featured_product_stream_id" ON "stream_featured_product" ("stream_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stream_featured_product_deleted_at" ON "stream_featured_product" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_stream_featured_product_display_order" ON "stream_featured_product" ("display_order") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "stream_featured_product" add constraint "stream_featured_product_stream_id_foreign" foreign key ("stream_id") references "live_stream" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "stream_featured_product" drop constraint if exists "stream_featured_product_stream_id_foreign";`);

    this.addSql(`drop table if exists "live_stream" cascade;`);

    this.addSql(`drop table if exists "stream_featured_product" cascade;`);
  }

}
